#!/bin/bash
# Log Viewer Script for VuCar Application
# Provides easy access to different log types

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
LOGS_DIR="./logs"
TODAY=$(date +%Y-%m-%d)

# Functions
show_menu() {
    echo -e "${BLUE}==================================${NC}"
    echo -e "${BLUE}   VuCar Logs Viewer${NC}"
    echo -e "${BLUE}==================================${NC}"
    echo ""
    echo "1) Application Logs (Today)"
    echo "2) Error Logs (Today)"
    echo "3) API Request Logs (Today)"
    echo "4) Database Logs (Today)"
    echo "5) All Logs (Live Tail)"
    echo "6) Search Logs"
    echo "7) Show Log Statistics"
    echo "8) Clean Old Logs"
    echo "9) Exit"
    echo ""
}

view_app_logs() {
    echo -e "${GREEN}📄 Viewing Application Logs...${NC}"
    if [ -f "$LOGS_DIR/application/app-$TODAY.log" ]; then
        tail -f "$LOGS_DIR/application/app-$TODAY.log"
    else
        echo -e "${RED}No logs found for today${NC}"
    fi
}

view_error_logs() {
    echo -e "${RED}❌ Viewing Error Logs...${NC}"
    if [ -f "$LOGS_DIR/application/error-$TODAY.log" ]; then
        tail -f "$LOGS_DIR/application/error-$TODAY.log"
    else
        echo -e "${GREEN}No errors logged today! 🎉${NC}"
    fi
}

view_api_logs() {
    echo -e "${YELLOW}🔗 Viewing API Request Logs...${NC}"
    if [ -f "$LOGS_DIR/api/requests-$TODAY.log" ]; then
        tail -f "$LOGS_DIR/api/requests-$TODAY.log"
    else
        echo -e "${RED}No API logs found for today${NC}"
    fi
}

view_db_logs() {
    echo -e "${BLUE}🗄️  Viewing Database Logs...${NC}"
    if [ -f "$LOGS_DIR/database/queries-$TODAY.log" ]; then
        tail -f "$LOGS_DIR/database/queries-$TODAY.log"
    else
        echo -e "${RED}No database logs found for today${NC}"
    fi
}

view_all_logs() {
    echo -e "${GREEN}📊 Viewing All Logs (Live)...${NC}"
    tail -f $LOGS_DIR/**/*.log 2>/dev/null || echo -e "${RED}No logs found${NC}"
}

search_logs() {
    echo -e "${YELLOW}🔍 Search Logs${NC}"
    read -p "Enter search term: " search_term
    
    echo ""
    echo -e "${BLUE}Searching for: ${search_term}${NC}"
    echo ""
    
    grep -r "$search_term" $LOGS_DIR/**/*.log --color=always 2>/dev/null || echo -e "${RED}No results found${NC}"
}

show_statistics() {
    echo -e "${BLUE}📊 Log Statistics${NC}"
    echo ""
    
    # Application logs
    if [ -f "$LOGS_DIR/application/app-$TODAY.log" ]; then
        APP_LINES=$(wc -l < "$LOGS_DIR/application/app-$TODAY.log")
        echo -e "${GREEN}Application Logs:${NC} $APP_LINES lines"
    fi
    
    # Error logs
    if [ -f "$LOGS_DIR/application/error-$TODAY.log" ]; then
        ERROR_LINES=$(wc -l < "$LOGS_DIR/application/error-$TODAY.log")
        echo -e "${RED}Error Logs:${NC} $ERROR_LINES lines"
    else
        echo -e "${RED}Error Logs:${NC} 0 lines"
    fi
    
    # API logs
    if [ -f "$LOGS_DIR/api/requests-$TODAY.log" ]; then
        API_LINES=$(wc -l < "$LOGS_DIR/api/requests-$TODAY.log")
        echo -e "${YELLOW}API Request Logs:${NC} $API_LINES lines"
    fi
    
    # Disk usage
    echo ""
    echo -e "${BLUE}Disk Usage:${NC}"
    du -sh $LOGS_DIR/* 2>/dev/null || echo "No logs"
    
    echo ""
    echo -e "${BLUE}Total Logs Size:${NC}"
    du -sh $LOGS_DIR 2>/dev/null || echo "0B"
}

clean_old_logs() {
    echo -e "${YELLOW}🧹 Clean Old Logs${NC}"
    read -p "Delete logs older than how many days? (default: 30): " days
    days=${days:-30}
    
    echo ""
    echo -e "${YELLOW}Finding logs older than $days days...${NC}"
    
    find $LOGS_DIR -name "*.log" -mtime +$days -exec ls -lh {} \;
    
    echo ""
    read -p "Delete these files? (y/N): " confirm
    
    if [[ $confirm == [yY] ]]; then
        find $LOGS_DIR -name "*.log" -mtime +$days -delete
        echo -e "${GREEN}✅ Old logs deleted${NC}"
    else
        echo -e "${BLUE}Cancelled${NC}"
    fi
}

# Main loop
while true; do
    show_menu
    read -p "Choose an option (1-9): " choice
    echo ""
    
    case $choice in
        1)
            view_app_logs
            ;;
        2)
            view_error_logs
            ;;
        3)
            view_api_logs
            ;;
        4)
            view_db_logs
            ;;
        5)
            view_all_logs
            ;;
        6)
            search_logs
            ;;
        7)
            show_statistics
            ;;
        8)
            clean_old_logs
            ;;
        9)
            echo -e "${GREEN}👋 Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
    clear
done
