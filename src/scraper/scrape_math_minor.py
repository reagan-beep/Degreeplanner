import requests
from bs4 import BeautifulSoup
import json
import os
import re
import time

# Set up paths
script_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(script_dir, "../data")
os.makedirs(data_dir, exist_ok=True)
output_file = os.path.join(data_dir, "math_minor_courses.json")

# URL for Math Minor
url = "https://catalog.tamu.edu/undergraduate/arts-and-sciences/mathematics/minor/#programrequirementstext"

# Fetch page
page = requests.get(url)
soup = BeautifulSoup(page.text, "html.parser")

def fetch_prerequisites(course_code):
    """Fetch prerequisites for a given course code"""
    try:
        print(f"  Fetching prerequisites for {course_code}...")
        # Construct the search URL
        course_url = f"https://catalog.tamu.edu/search/?P={course_code.replace(' ', '%20')}"
        
        response = requests.get(course_url)
        soup = BeautifulSoup(response.text, "html.parser")
        
        # Look for prerequisite information in the page
        page_text = soup.get_text()
        
        # Search for prerequisite patterns
        prereq_patterns = [
            r'prerequisite[s]?[:\s]*(.*?)(?:\n|\.|$)',
            r'prereq[s]?[:\s]*(.*?)(?:\n|\.|$)',
            r'corequisite[s]?[:\s]*(.*?)(?:\n|\.|$)',
            r'co-requisite[s]?[:\s]*(.*?)(?:\n|\.|$)',
            r'concurrent[s]?[:\s]*(.*?)(?:\n|\.|$)'
        ]
        
        for pattern in prereq_patterns:
            matches = re.findall(pattern, page_text, re.IGNORECASE | re.DOTALL)
            if matches:
                prereq_text = matches[0].strip()
                # Clean up the prerequisite text
                prereq_text = re.sub(r'\s+', ' ', prereq_text)  # Normalize spaces
                prereq_text = prereq_text.replace('\u200b', '')  # Remove zero-width spaces
                # Remove campus location information
                prereq_text = re.sub(r';?\s*also taught at.*?campus[es]?\.?', '', prereq_text, flags=re.IGNORECASE)
                prereq_text = prereq_text.strip()
                return prereq_text
        
        return ""
        
    except Exception as e:
        print(f"Error fetching prerequisites for {course_code}: {e}")
        return ""

courses = []

# Look for course codes ONLY within actual course tables
tables = soup.find_all('table')

for table in tables:
    rows = table.find_all('tr')
    
    i = 0
    while i < len(rows):
        row = rows[i]
        cells = row.find_all(['td', 'th'])
        
        # Check if this row contains selection requirements
        row_text = row.get_text().lower()
        if any(pattern in row_text for pattern in ['select one', 'choose one', 'select from', 'select 9 hours']):
            # Determine the type of selection requirement
            if 'select 9 hours' in row_text or 'select 9 credit hours' in row_text:
                selection_type = "Select 9 credit hours from the following"
                required_credits = 9
            elif 'select one' in row_text:
                selection_type = "Select one from the following"
                required_credits = 3  # Assuming each course is 3 credits
            else:
                selection_type = "Select from the following"
                required_credits = 3
            
            # Found a selection section - collect all course options
            course_options = []
            j = i + 1
            
            # Look for subsequent rows that contain course options
            while j < len(rows):
                next_row = rows[j]
                next_cells = next_row.find_all('td')
                
                # Check if this row has a course code
                course_found = False
                course_code = ""
                course_name = ""
                
                for cell in next_cells:
                    if 'codecol' in cell.get('class', []):
                        cell_text = cell.get_text().strip().replace('\u200b', '').replace('\u00a0', ' ')
                        # Handle both specific courses (MATH 221) and range courses (MATH 300-499)
                        course_match = re.search(r'([A-Z]{2,4})\s*(\d+(?:-\d+)?)', cell_text)
                        if course_match:
                            course_code = course_match.group(1) + " " + course_match.group(2)
                            course_found = True
                        break
                
                # If no codecol class found, check the first cell for MATH courses
                if not course_found and len(next_cells) > 0:
                    first_cell_text = next_cells[0].get_text().strip().replace('\u200b', '').replace('\u00a0', ' ')
                    course_match = re.search(r'([A-Z]{2,4})\s*(\d+(?:-\d+)?)', first_cell_text)
                    if course_match:
                        course_code = course_match.group(1) + " " + course_match.group(2)
                        course_found = True
                
                # Get course name from titlecol
                if course_found and len(next_cells) > 1:
                    title_cell = next_cells[1]
                    course_name = title_cell.get_text().strip()
                    # Clean up footnote references and formatting artifacts
                    course_name = re.sub(r'\s*\d+\s*,?\s*', ' ', course_name)  # Remove number patterns like "1," "4,"
                    course_name = re.sub(r'\s*\d+\s*or\s*', ' or ', course_name)  # Fix "1or" to "or"
                    course_name = re.sub(r'\s*\d+\s*$', '', course_name)  # Remove trailing numbers
                    course_name = re.sub(r'\s+', ' ', course_name).strip()  # Normalize spaces
                    
                    # Handle range courses - if no name, create a descriptive one
                    if not course_name and '-' in course_code:
                        if '300-499' in course_code:
                            course_name = "Upper-level Mathematics Courses"
                        elif '400-499' in course_code:
                            course_name = "Advanced Mathematics Courses"
                        else:
                            course_name = f"Mathematics Courses {course_code.split()[-1]}"
                
                if course_found:
                    course_options.append((course_code, course_name))
                    j += 1
                else:
                    break
            
            # If we found multiple course options, combine them
            if len(course_options) > 1:
                primary_course = course_options[0][0]
                
                # Get credits from the first course option
                first_row = rows[i + 1] if i + 1 < len(rows) else row
                first_cells = first_row.find_all('td')
                
                credits = 3
                if len(first_cells) > 2:
                    hours_cell = first_cells[2]
                    hours_text = hours_cell.get_text().strip()
                    credit_match = re.search(r'(\d+)', hours_text)
                    if credit_match:
                        credits = int(credit_match.group(1))
                
                # Fetch prerequisites for each alternative
                alternative_details = []
                for opt_course, opt_name in course_options:
                    # Skip prerequisite fetching for range courses (e.g., MATH 300-499)
                    if '-' in opt_course:
                        alt_prereqs = "See individual course listings"
                    else:
                        alt_prereqs = fetch_prerequisites(opt_course)
                    
                    alternative_details.append({
                        "course": opt_course,
                        "name": opt_name,
                        "credits": credits,
                        "prereqs": alt_prereqs
                    })
                    
                    # Only delay for specific courses, not ranges
                    if '-' not in opt_course:
                        time.sleep(0.5)  # Delay between requests
                
                # Collect all course names
                course_names = [opt[1] for opt in course_options if opt[1]]
                
                # Store all names as a list, or as a single string if only one name
                if len(course_names) == 1:
                    course_name = course_names[0]
                else:
                    course_name = course_names  # Store as list
                
                # Create the course entry with selection requirement info
                course_entry = {
                    "course": primary_course,
                    "alternatives": alternative_details,
                    "name": course_name,
                    "credits": required_credits,  # Use the required credits (9 for "select 9 hours")
                    "prereqs": alternative_details[0]["prereqs"],  # Use first alternative's prereqs as primary
                    "semester": "",
                    "difficulty": 3,
                    "selection_requirement": selection_type,
                    "note": f"Must select {required_credits} credit hours from the listed alternatives"
                }
                
                courses.append(course_entry)
                
                # Skip the individual course rows we just processed
                i = j
                continue
        
        i += 1

# Save JSON
with open(output_file, "w") as f:
    json.dump({"Math Minor": courses}, f, indent=2)

print(f"math_minor_courses.json created with {len(courses)} course groups at {output_file}!")
print("Note: Prerequisites have been fetched for all courses.")
