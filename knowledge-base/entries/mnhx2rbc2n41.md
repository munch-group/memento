- [ ]  Create a notion-tools repo
- [ ]  Implement to tool outlined below (include option for reminder)
- [ ]  Extend it so it can also add an issue using gh and link it to it in the notion task ****

## **Python CLI Tool for Adding Tasks to Notion**

Here's a complete Python script that creates a terminal command for adding tasks to your Notion database with customizable properties:

### **Installation**

First, install the required packages:

bash

`pip install notion-client python-dotenv argparse`

### **Complete Script: `notion-task.py`**

```python
*#!/usr/bin/env python3*
import os
import sys
import argparse
from datetime import datetime, date
from notion_client import Client
from dotenv import load_dotenv
import json

*# Load environment variables*
load_dotenv()

*# Initialize Notion client*
notion = Client(auth=os.getenv("NOTION_API_KEY"))
DATABASE_ID = os.getenv("NOTION_DATABASE_ID")

def create_task(args):
    """Create a task in Notion with given properties"""
    
    *# Build properties object*
    properties = {
        "Name": {  *# Title property (adjust name to match your DB)*
            "title": [
                {
                    "text": {
                        "content": args.title
                    }
                }
            ]
        }
    }
    
    *# Add optional properties if provided*
    if args.status:
        properties["Status"] = {
            "select": {
                "name": args.status
            }
        }
    
    if args.priority:
        properties["Priority"] = {
            "select": {
                "name": args.priority
            }
        }
    
    if args.assignee:
        *# For people property - needs user ID# You might want to create a mapping of names to IDs*
        properties["Assignee"] = {
            "people": [
                {
                    "object": "user",
                    "id": get_user_id(args.assignee)
                }
            ]
        }
    
    if args.due:
        properties["Due Date"] = {
            "date": {
                "start": args.due
            }
        }
    
    if args.tags:
        properties["Tags"] = {
            "multi_select": [
                {"name": tag.strip()} for tag in args.tags.split(',')
            ]
        }
    
    if args.description:
        properties["Description"] = {
            "rich_text": [
                {
                    "text": {
                        "content": args.description
                    }
                }
            ]
        }
    
    if args.url:
        properties["URL"] = {
            "url": args.url
        }
    
    if args.estimate:
        properties["Estimate"] = {
            "number": args.estimate
        }
    
    if args.checkbox:
        properties["Done"] = {
            "checkbox": args.checkbox
        }
    
    *# Handle custom properties from JSON*
    if args.properties:
        custom_props = json.loads(args.properties)
        properties.update(format_custom_properties(custom_props))
    
    *# Create page content if provided*
    children = []
    if args.content:
        children = [
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [
                        {
                            "type": "text",
                            "text": {
                                "content": args.content
                            }
                        }
                    ]
                }
            }
        ]
    
    *# Create the page*
    try:
        response = notion.pages.create(
            parent={"database_id": DATABASE_ID},
            properties=properties,
            children=children if children else None
        )
        
        *# Get the URL of the created page*
        page_url = response["url"]
        page_id = response["id"]
        
        print(f"✅ Task created successfully!")
        print(f"📝 Title: {args.title}")
        print(f"🔗 URL: {page_url}")
        print(f"🆔 ID: {page_id}")
        
        if args.verbose:
            print("\n📋 Properties set:")
            for key, value in properties.items():
                print(f"  - {key}: {format_property_value(value)}")
        
        return response
        
    except Exception as e:
        print(f"❌ Error creating task: {str(e)}")
        if args.verbose:
            print(f"Properties attempted: {json.dumps(properties, indent=2)}")
        sys.exit(1)

def format_custom_properties(custom_props):
    """Format custom properties based on their type"""
    formatted = {}
    
    for key, value in custom_props.items():
        if isinstance(value, bool):
            formatted[key] = {"checkbox": value}
        elif isinstance(value, (int, float)):
            formatted[key] = {"number": value}
        elif isinstance(value, list):
            formatted[key] = {
                "multi_select": [{"name": str(item)} for item in value]
            }
        elif value.startswith("http"):
            formatted[key] = {"url": value}
        elif value.startswith("@"):
            *# Email property*
            formatted[key] = {"email": value[1:]}
        else:
            *# Default to text/select*
            formatted[key] = {"select": {"name": str(value)}}
    
    return formatted

def format_property_value(prop):
    """Format property value for display"""
    if "title" in prop:
        return prop["title"][0]["text"]["content"] if prop["title"] else ""
    elif "select" in prop:
        return prop["select"]["name"]
    elif "multi_select" in prop:
        return ", ".join([item["name"] for item in prop["multi_select"]])
    elif "date" in prop:
        return prop["date"]["start"]
    elif "checkbox" in prop:
        return "✓" if prop["checkbox"] else "✗"
    elif "number" in prop:
        return str(prop["number"])
    elif "url" in prop:
        return prop["url"]
    elif "rich_text" in prop:
        return prop["rich_text"][0]["text"]["content"] if prop["rich_text"] else ""
    else:
        return str(prop)

def get_user_id(username):
    """Get Notion user ID from username or email"""
    *# This is a simplified version - you might want to cache this*
    try:
        users = notion.users.list()
        for user in users["results"]:
            if user.get("name") == username or user.get("person", {}).get("email") == username:
                return user["id"]
    except:
        pass
    
    *# Return as-is if not found (might be an ID already)*
    return username

def list_database_properties():
    """List all properties in the database for reference"""
    try:
        database = notion.databases.retrieve(database_id=DATABASE_ID)
        print("\n📊 Database Properties:")
        print("-" * 40)
        
        for prop_name, prop_data in database["properties"].items():
            prop_type = prop_data["type"]
            print(f"• {prop_name}: {prop_type}")
            
            *# Show options for select/multi-select*
            if prop_type == "select" and "select" in prop_data:
                options = [opt["name"] for opt in prop_data["select"]["options"]]
                if options:
                    print(f"  Options: {', '.join(options)}")
            elif prop_type == "multi_select" and "multi_select" in prop_data:
                options = [opt["name"] for opt in prop_data["multi_select"]["options"]]
                if options:
                    print(f"  Options: {', '.join(options)}")
        
        print("-" * 40)
    except Exception as e:
        print(f"❌ Error fetching database properties: {str(e)}")

def main():
    parser = argparse.ArgumentParser(
        description="Add a task to Notion database",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s "Review PR" --status "In Progress" --priority "High"
  %(prog)s "Team meeting" --due 2024-12-25 --tags "meeting,weekly"
  %(prog)s "Bug fix" --assignee "john@example.com" --estimate 3
  %(prog)s "Research task" --content "Look into new API options"
  %(prog)s "Custom task" --properties '{"Sprint": "Sprint 1", "Points": 5}'
  %(prog)s --list-properties  # Show all database properties
        """
    )
    
    *# Required argument*
    parser.add_argument("title", nargs="?", help="Task title")
    
    *# Optional arguments for common properties*
    parser.add_argument("-s", "--status", help="Task status (e.g., 'To Do', 'In Progress', 'Done')")
    parser.add_argument("-p", "--priority", help="Task priority (e.g., 'Low', 'Medium', 'High')")
    parser.add_argument("-a", "--assignee", help="Assignee username or email")
    parser.add_argument("-d", "--due", help="Due date (YYYY-MM-DD format)")
    parser.add_argument("-t", "--tags", help="Comma-separated tags")
    parser.add_argument("--description", help="Task description (rich text)")
    parser.add_argument("-u", "--url", help="Related URL")
    parser.add_argument("-e", "--estimate", type=float, help="Time estimate (number)")
    parser.add_argument("--checkbox", action="store_true", help="Mark as done")
    parser.add_argument("-c", "--content", help="Page content (appears below properties)")
    
    *# Advanced options*
    parser.add_argument("--properties", help="Custom properties as JSON string")
    parser.add_argument("-v", "--verbose", action="store_true", help="Verbose output")
    parser.add_argument("--list-properties", action="store_true", help="List database properties and exit")
    
    args = parser.parse_args()
    
    *# Check environment variables*
    if not os.getenv("NOTION_API_KEY") or not os.getenv("NOTION_DATABASE_ID"):
        print("❌ Error: NOTION_API_KEY and NOTION_DATABASE_ID must be set in .env file")
        print("\nCreate a .env file with:")
        print("NOTION_API_KEY=your_api_key_here")
        print("NOTION_DATABASE_ID=your_database_id_here")
        sys.exit(1)
    
    *# Handle list properties flag*
    if args.list_properties:
        list_database_properties()
        sys.exit(0)
    
    *# Check for title*
    if not args.title:
        parser.error("Title is required (unless using --list-properties)")
    
    *# Create the task*
    create_task(args)

if __name__ == "__main__":
    main()
```

### **Setup Instructions**

1. **Create `.env` file**:

bash

`*# .env*
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

1. **Make script executable**:

bash

`chmod +x notion-task.py`

1. **Optional: Create alias or install globally**:

bash

`*# Add to ~/.bashrc or ~/.zshrc*
alias task='python3 /path/to/notion-task.py'

*# Or create a proper command*
sudo ln -s /path/to/notion-task.py /usr/local/bin/notion-task`

### **Usage Examples**

bash

```python
*# Simple task*
./notion-task.py "Review pull request"

*# Task with status and priority*
./notion-task.py "Fix bug in auth flow" --status "In Progress" --priority "High"

*# Task with due date and assignee*
./notion-task.py "Prepare presentation" --due 2024-12-25 --assignee "john@example.com"

*# Task with multiple tags*
./notion-task.py "Research new framework" --tags "research,backend,q4"

*# Task with time estimate and description*
./notion-task.py "Implement feature X" --estimate 5 --description "Add user authentication"

*# Task with page content*
./notion-task.py "Project planning" --content "Define milestones and deliverables for Q1"

*# Complex task with custom properties*
./notion-task.py "Sprint task" --properties '{"Sprint": "Sprint 23", "Story Points": 8, "Epic": "User Auth"}'

*# List all database properties*
./notion-task.py --list-properties

*# Verbose output*
./notion-task.py "Debug task" --status "To Do" --verbose
```

### **Enhanced Version with Config File**

For frequently used databases, create a config file:

python

```json
*# notion-config.json*
{
  "databases": {
    "tasks": "xxxxxxxxxxxxx",
    "bugs": "yyyyyyyyyyyyy",
    "ideas": "zzzzzzzzzzzzz"
  },
  "defaults": {
    "status": "To Do",
    "priority": "Medium"
  },
  "user_mapping": {
    "john": "user-id-xxxxx",
    "sarah": "user-id-yyyyy"
  }
}
```

Then add database selection to the script:

```bash
./notion-task.py "New bug" --db bugs --status "Open"
./notion-task.py "Feature idea" --db ideas
```

### **Shell Function for Even Simpler Usage**

Add to your `.bashrc` or `.zshrc`:

```bash
*# Quick task function*
qt() {
    if [ $# -eq 0 ]; then
        echo "Usage: qt <task title> [options]"
        return 1
    fi
    python3 /path/to/notion-task.py "$@"
}

*# Quick task with default status*
todo() {
    python3 /path/to/notion-task.py "$1" --status "To Do" "${@:2}"
}

*# Quick task in progress*
wip() {
    python3 /path/to/notion-task.py "$1" --status "In Progress" "${@:2}"
}
```

Usage:

```bash
qt "New task"
todo "Research task" --tags "research"
wip "Current work" --priority "High"
```

This gives you a powerful, flexible CLI tool for quickly adding tasks to Notion with full property support!