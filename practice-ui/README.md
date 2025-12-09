# 🎯 Interview Prep Practice Portal

An interactive web-based practice portal for Java + Selenium + API Testing interview preparation.

## 📋 Features

- **📅 Structured Learning**: Follow day-by-day practice schedules
- **✅ Progress Tracking**: Mark tasks and days as complete
- **💾 Local Storage**: Your progress is saved automatically
- **🎨 Beautiful UI**: Clean, modern, and responsive design
- **📊 Multiple Tracks**: Choose from Fast, Standard, or Comfortable learning tracks
- **💻 Practice Exercises**: Hands-on coding exercises with difficulty levels
- **📚 Resources**: Curated learning resources for each topic

## 🚀 Getting Started

### Option 1: Open Directly in Browser

1. Navigate to the `practice-ui` folder
2. Double-click on `index.html` to open in your default browser
3. Start practicing!

### Option 2: Using Live Server (Recommended)

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"
4. The portal will open in your browser with auto-reload

### Option 3: Using Python HTTP Server

```bash
cd practice-ui
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## 📖 How to Use

### 1. Choose Your Track

Select from three learning tracks based on your available time:
- **Fast Track**: 3 months (25-30 hours/week)
- **Standard Track**: 4-5 months (15-20 hours/week)
- **Comfortable Track**: 6 months (10-15 hours/week)

### 2. Navigate Through Weeks

- Click on any week in the sidebar to expand it
- View all days within that week
- Days marked with ✅ are completed
- Days marked with ⭕ are pending

### 3. Practice Each Day

- Click on a day to view its content
- Read the focus area and time commitment
- Complete all tasks by checking them off
- Try practice exercises (click to view details)
- Access learning resources
- Mark the day as complete when done

### 4. Track Your Progress

- View completed days count in the header
- See overall progress percentage
- Export your progress as JSON
- Reset progress if needed

## 🎨 Features in Detail

### Task Management
- Check off individual tasks as you complete them
- Tasks are saved automatically
- Visual feedback for completed tasks

### Practice Exercises
- Click on any exercise card to view details
- See difficulty level (Easy/Medium/Hard)
- View example code and hints
- Practice at your own pace

### Progress Persistence
- All progress is saved in browser's local storage
- Your progress persists across sessions
- Export progress to backup
- Import progress to restore

### Responsive Design
- Works on desktop, tablet, and mobile
- Optimized for all screen sizes
- Touch-friendly interface

## 📁 Project Structure

```
practice-ui/
├── index.html          # Main HTML file
├── styles.css          # All styling
├── app.js             # JavaScript logic
├── practice-data.json # Practice content data
└── README.md          # This file
```

## 🔧 Customization

### Adding More Content

Edit `practice-data.json` to add more weeks, days, or exercises:

```json
{
  "standard": {
    "weeks": [
      {
        "title": "Week X: Topic",
        "days": [
          {
            "id": X,
            "title": "Day X: Subtopic",
            "focus": "What to learn",
            "timeCommitment": "X hours",
            "tasks": [...],
            "practice": [...],
            "resources": [...]
          }
        ]
      }
    ]
  }
}
```

### Modifying Styles

Edit `styles.css` to customize:
- Colors (CSS variables in `:root`)
- Fonts
- Layout
- Animations

### Extending Functionality

Edit `app.js` to add:
- New features
- Additional tracking
- Custom behaviors

## 💡 Tips for Success

1. **Be Consistent**: Practice daily, even if just for 30 minutes
2. **Complete Tasks**: Don't skip tasks, they build on each other
3. **Try Exercises**: Hands-on practice is crucial
4. **Use Resources**: Check the provided links for deeper learning
5. **Track Progress**: Regularly review your progress to stay motivated

## 🐛 Troubleshooting

### Progress Not Saving?
- Check if browser allows local storage
- Try a different browser
- Clear cache and reload

### JSON Not Loading?
- Ensure all files are in the same directory
- Use a local server instead of opening directly
- Check browser console for errors

### Styling Issues?
- Clear browser cache
- Ensure `styles.css` is in the same folder
- Check for CSS file loading errors

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors (F12)
2. Verify all files are present
3. Try using a local server
4. Clear browser cache and reload

## 🎓 Learning Path

This portal is designed to complement the main interview prep guide:
- Start with Week 1, Day 1
- Complete all tasks before moving forward
- Practice exercises thoroughly
- Review resources for deeper understanding
- Mark days complete only when confident

## 📈 Progress Tracking

Your progress includes:
- Completed days count
- Individual task completion
- Overall progress percentage
- Exportable progress data

## 🌟 Best Practices

1. **Set a Schedule**: Dedicate specific times for practice
2. **Stay Organized**: Complete days in order
3. **Take Notes**: Document your learning
4. **Build Projects**: Apply what you learn
5. **Review Regularly**: Revisit completed topics

---

**Happy Learning! 🚀**

Start your journey by selecting a track and clicking on Day 1!