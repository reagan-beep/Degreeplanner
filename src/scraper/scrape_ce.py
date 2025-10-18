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
output_file = os.path.join(data_dir, "ce_courses.json")

# URL for Computer Engineering undergraduate courses
url = "https://catalog.tamu.edu/undergraduate/engineering/computer-science/computer-engineering-bs/#programrequirementstext"

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
    
    current_year = ""
    current_semester = ""
    
    i = 0
    while i < len(rows):
        row = rows[i]
        cells = row.find_all(['td', 'th'])
        
        # Check if this is a year header (has 'year' class)
        if len(cells) > 0 and 'year' in cells[0].get('class', []):
            current_year = cells[0].get_text().strip()
            i += 1
            continue
        
        # Check if this is a semester header (first cell contains semester name)
        if len(cells) > 0:
            first_cell_text = cells[0].get_text().strip()
            if any(sem in first_cell_text.lower() for sem in ['fall', 'spring', 'summer']):
                current_semester = first_cell_text
                i += 1
                continue
        
        # Check if this row contains "select one" text
        row_text = row.get_text().lower()
        if any(pattern in row_text for pattern in ['select one', 'choose one', 'select from']):
            # Found a "select one" section - collect all course options
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
                        course_match = re.search(r'([A-Z]{2,4})\s*(\d+)', cell_text)
                        if course_match:
                            course_code = course_match.group(1) + " " + course_match.group(2)
                            course_found = True
                        break
                
                # Get course name from titlecol
                if course_found and len(next_cells) > 1:
                    title_cell = next_cells[1]
                    course_name = title_cell.get_text().strip()
                    # Clean up footnote references and formatting artifacts
                    course_name = re.sub(r'\s*\d+\s*,?\s*', ' ', course_name)  # Remove number patterns like "1," "4,"
                    course_name = re.sub(r'\s*\d+\s*or\s*', ' or ', course_name)  # Fix "1or" to "or"
                    course_name = re.sub(r'\s*\d+\s*$', '', course_name)  # Remove trailing numbers
                    course_name = re.sub(r'\s+', ' ', course_name).strip()  # Normalize spaces
                
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
                    alt_prereqs = fetch_prerequisites(opt_course)
                    alternative_details.append({
                        "course": opt_course,
                        "name": opt_name,
                        "credits": credits,
                        "prereqs": alt_prereqs
                    })
                    time.sleep(0.5)  # Delay between requests
                
                # Collect all course names
                course_names = [opt[1] for opt in course_options if opt[1]]
                
                # Store all names as a list, or as a single string if only one name
                if len(course_names) == 1:
                    course_name = course_names[0]
                else:
                    course_name = course_names  # Store as list
                
                # Create semester string
                semester = f"{current_year} {current_semester}".strip()
                
                courses.append({
                    "course": primary_course,
                    "alternatives": alternative_details,
                    "name": course_name,
                    "credits": credits,
                    "prereqs": alternative_details[0]["prereqs"],  # Use first alternative's prereqs as primary
                    "semester": semester,
                    "difficulty": 3
                })
                
                # Skip the individual course rows we just processed
                i = j
                continue
        
        # Regular course processing (not part of a "select one" group)
        for cell in cells:
            if 'codecol' in cell.get('class', []):
                cell_text = cell.get_text().strip().replace('\u200b', '').replace('\u00a0', ' ')
                
                # Extract course code(s) - handle alternatives like "ENGL 103 or ENGL 104"
                alternatives = []
                
                if 'or' in cell_text.lower():
                    # Handle alternatives - split by "or" and process each
                    course_parts = re.split(r'\s+or\s+', cell_text)
                    for part in course_parts:
                        course_match = re.search(r'([A-Z]{2,4})\s*(\d+)', part.strip())
                        if course_match:
                            alternatives.append(course_match.group(1) + " " + course_match.group(2))
                    course_code = alternatives[0] if alternatives else cell_text
                elif '/' in cell_text:
                    # Handle same course under different departments (e.g., ENGR 216/PHYS 216)
                    course_parts = cell_text.split('/')
                    for part in course_parts:
                        course_match = re.search(r'([A-Z]{2,4})\s*(\d+)', part.strip())
                        if course_match:
                            alternatives.append(course_match.group(1) + " " + course_match.group(2))
                    course_code = alternatives[0] if alternatives else cell_text
                else:
                    # Single course
                    course_match = re.search(r'([A-Z]{2,4})\s*(\d+)', cell_text)
                    if course_match:
                        course_code = course_match.group(1) + " " + course_match.group(2)
                        alternatives = [course_code]
                    else:
                        continue
                
                # Handle special entries like "University Core Curriculum" or "Senior Design"
                if not re.search(r'[A-Z]{2,4}\s*\d+', course_code):
                    # This is a special entry, not a regular course
                    special_entry = cell_text
                    
                    # Initialize defaults for special entries
                    course_name = ""
                    credits = 3
                    
                    # Extract course name from titlecol (cell 1)
                    if len(cells) > 1:
                        title_cell = cells[1]
                        course_name = title_cell.get_text().strip()
                        # Clean up footnote references and formatting artifacts
                        course_name = re.sub(r'\s*\d+\s*,?\s*', ' ', course_name)  # Remove number patterns like "1," "4,"
                        course_name = re.sub(r'\s*\d+\s*or\s*', ' or ', course_name)  # Fix "1or" to "or"
                        course_name = re.sub(r'\s*\d+\s*$', '', course_name)  # Remove trailing numbers
                        course_name = re.sub(r'\s+', ' ', course_name).strip()  # Normalize spaces
                    
                    # Extract credits from hourscol (cell 2)
                    if len(cells) > 2:
                        hours_cell = cells[2]
                        hours_text = hours_cell.get_text().strip()
                        credit_match = re.search(r'(\d+)', hours_text)
                        if credit_match:
                            credits = int(credit_match.group(1))
                    
                    # Create semester string
                    semester = f"{current_year} {current_semester}".strip()
                    
                    # Add special entry (no duplicate checking for these)
                    courses.append({
                        "course": special_entry,
                        "name": course_name,
                        "credits": credits,
                        "prereqs": "",
                        "semester": semester,
                        "difficulty": 3
                    })
                    
                    i += 1
                    continue
                
                # Initialize defaults
                course_name = ""
                credits = 3
                
                # Extract course name from titlecol (cell 1)
                if len(cells) > 1:
                    title_cell = cells[1]
                    course_name = title_cell.get_text().strip()
                    # Clean up footnote references and formatting artifacts
                    course_name = re.sub(r'\s*\d+\s*,?\s*', ' ', course_name)  # Remove number patterns like "1," "4,"
                    course_name = re.sub(r'\s*\d+\s*or\s*', ' or ', course_name)  # Fix "1or" to "or"
                    course_name = re.sub(r'\s*\d+\s*$', '', course_name)  # Remove trailing numbers
                    course_name = re.sub(r'\s+', ' ', course_name).strip()  # Normalize spaces
                
                # Extract credits from hourscol (cell 2)
                if len(cells) > 2:
                    hours_cell = cells[2]
                    hours_text = hours_cell.get_text().strip()
                    credit_match = re.search(r'(\d+)', hours_text)
                    if credit_match:
                        credits = int(credit_match.group(1))
                
                # Only add if we haven't seen this course before
                if not any(course['course'] == course_code for course in courses):
                    # Create semester string
                    semester = f"{current_year} {current_semester}".strip()
                    
                    # If there are multiple alternatives, fetch individual info for each
                    if len(alternatives) > 1:
                        alternative_details = []
                        for alt_course in alternatives:
                            alt_prereqs = fetch_prerequisites(alt_course)
                            # For now, use the same name and credits for all alternatives
                            # In a more sophisticated version, we could fetch individual names
                            alternative_details.append({
                                "course": alt_course,
                                "name": course_name,
                                "credits": credits,
                                "prereqs": alt_prereqs
                            })
                            time.sleep(0.5)  # Delay between requests
                        
                        courses.append({
                            "course": course_code,
                            "alternatives": alternative_details,
                            "name": course_name,
                            "credits": credits,
                            "prereqs": alternative_details[0]["prereqs"],  # Use first alternative's prereqs as primary
                            "semester": semester,
                            "difficulty": 3
                        })
                    else:
                        # Single course - fetch prerequisites
                        prereqs = fetch_prerequisites(course_code)

                        courses.append({
                            "course": course_code,
                            "name": course_name,
                            "credits": credits,
                            "prereqs": prereqs,
                            "semester": semester,
                            "difficulty": 3
                        })
                        
                        # Add a small delay to be respectful to the server
                        time.sleep(0.5)
        
        i += 1

# Save JSON
with open(output_file, "w") as f:
    json.dump({"Computer Engineering": courses}, f, indent=2)

print(f"ce_courses.json created with {len(courses)} courses at {output_file}!")
print("Note: Prerequisites have been fetched for all courses.")
