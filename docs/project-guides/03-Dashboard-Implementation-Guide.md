# 📊 Dashboard Implementation Guide
## Complete Dashboard Features with Analytics

---

## 🎯 Overview

This guide provides complete implementation details for the dashboard features including:
- Real-time progress tracking
- Streak calculations
- Achievement system
- Analytics and insights
- Study time tracking
- Category-wise progress
- Motivational system

---

## 📋 Dashboard Data Structure

### Complete Dashboard Service

**File**: `src/services/dashboardService.js`

```javascript
const progressService = require('./progressService');
const achievementService = require('./achievementService');
const streakService = require('./streakService');

class DashboardService {
  /**
   * Get complete dashboard data for user
   * @param {string} userId - User ID
   * @returns {Object} Dashboard data
   */
  async getDashboardData(userId) {
    const progress = await progressService.getProgress(userId);
    const user = await userService.getUserById(userId);

    return {
      overview: this.getOverview(progress, user),
      streak: this.getStreakData(progress),
      weeklyBreakdown: this.getWeeklyBreakdown(progress),
      categoryProgress: this.getCategoryProgress(progress),
      achievements: this.getAchievements(progress),
      studyGoals: this.getStudyGoals(progress, user),
      timeAnalytics: this.getTimeAnalytics(progress),
      recentActivity: this.getRecentActivity(progress),
      upcomingMilestones: this.getUpcomingMilestones(progress),
      motivation: this.getMotivation(progress)
    };
  }

  /**
   * Get overview statistics
   */
  getOverview(progress, user) {
    const trackData = this.getTrackData(user.preferences.track);
    const totalDays = trackData.totalDays;
    const completedDays = Object.keys(progress.completedDays || {}).length;
    const completionRate = Math.round((completedDays / totalDays) * 100);

    return {
      daysCompleted: completedDays,
      totalDays,
      completionRate,
      questionsStudied: progress.studiedQuestions?.length || 0,
      totalQuestions: 250,
      currentWeek: this.getCurrentWeek(completedDays, trackData),
      daysRemaining: totalDays - completedDays,
      estimatedCompletionDate: this.calculateEstimatedCompletion(
        completedDays,
        totalDays,
        progress.studySessions
      )
    };
  }

  /**
   * Get streak data with calendar
   */
  getStreakData(progress) {
    const streak = progress.streak || { current: 0, longest: 0 };
    const calendar = this.generateCalendar(progress.completedDays);
    const streakHistory = this.getStreakHistory(progress.studySessions);

    return {
      current: streak.current,
      longest: streak.longest,
      lastStudyDate: streak.lastStudyDate,
      calendar,
      streakHistory,
      isOnStreak: this.isOnStreak(streak.lastStudyDate),
      streakPercentile: this.calculateStreakPercentile(streak.current)
    };
  }

  /**
   * Generate 30-day calendar
   */
  generateCalendar(completedDays) {
    const calendar = [];
    const today = new Date();
    
    // Generate last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      calendar.push({
        date: dateStr,
        dayOfWeek: date.getDay(),
        studied: !!completedDays[dateStr],
        isToday: i === 0,
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
    }
    
    return calendar;
  }

  /**
   * Get weekly breakdown
   */
  getWeeklyBreakdown(progress) {
    const weeks = {};
    
    // Group completed days by week
    Object.keys(progress.completedDays || {}).forEach(dayKey => {
      const [week] = dayKey.split('-');
      weeks[week] = (weeks[week] || 0) + 1;
    });

    // Generate week data
    const weekData = [];
    for (let i = 1; i <= 12; i++) {
      const completed = weeks[i] || 0;
      const total = 5; // 5 days per week
      
      weekData.push({
        week: i,
        title: `Week ${i}`,
        completed,
        total,
        percentage: Math.round((completed / total) * 100),
        status: this.getWeekStatus(completed, total)
      });
    }

    return weekData;
  }

  /**
   * Get category-wise progress
   */
  getCategoryProgress(progress) {
    const categories = {
      java: { 
        name: 'Java', 
        icon: '☕', 
        color: '#f89820',
        studied: 0, 
        total: 50 
      },
      selenium: { 
        name: 'Selenium', 
        icon: '🌐',
        color: '#43b02a',
        studied: 0, 
        total: 45 
      },
      'api-testing': { 
        name: 'API Testing', 
        icon: '🔌',
        color: '#0078d4',
        studied: 0, 
        total: 40 
      },
      testng: { 
        name: 'TestNG', 
        icon: '🧪',
        color: '#e74c3c',
        studied: 0, 
        total: 30 
      },
      framework: { 
        name: 'Framework', 
        icon: '🏗️',
        color: '#9b59b6',
        studied: 0, 
        total: 50 
      },
      leadership: { 
        name: 'Leadership', 
        icon: '👔',
        color: '#34495e',
        studied: 0, 
        total: 35 
      }
    };

    // Count studied questions by category
    progress.studiedQuestions?.forEach(qId => {
      const category = this.getQuestionCategory(qId);
      if (categories[category]) {
        categories[category].studied++;
      }
    });

    return Object.entries(categories).map(([id, data]) => ({
      id,
      ...data,
      percentage: Math.round((data.studied / data.total) * 100),
      remaining: data.total - data.studied
    }));
  }

  /**
   * Get achievements with unlock status
   */
  getAchievements(progress) {
    const allAchievements = [
      {
        id: 'first_day',
        name: 'First Step',
        description: 'Complete your first day of study',
        icon: '🎯',
        category: 'milestone',
        points: 10
      },
      {
        id: 'week_warrior',
        name: 'Week Warrior',
        description: 'Complete 7 days of study',
        icon: '🔥',
        category: 'milestone',
        points: 50
      },
      {
        id: 'month_master',
        name: 'Month Master',
        description: 'Complete 30 days of study',
        icon: '🏆',
        category: 'milestone',
        points: 200
      },
      {
        id: 'question_master_50',
        name: 'Question Master',
        description: 'Study 50 questions',
        icon: '📚',
        category: 'learning',
        points: 50
      },
      {
        id: 'question_master_100',
        name: 'Century Club',
        description: 'Study 100 questions',
        icon: '💯',
        category: 'learning',
        points: 100
      },
      {
        id: 'streak_5',
        name: '5-Day Streak',
        description: 'Maintain a 5-day study streak',
        icon: '⚡',
        category: 'streak',
        points: 30
      },
      {
        id: 'streak_10',
        name: '10-Day Streak',
        description: 'Maintain a 10-day study streak',
        icon: '🔥',
        category: 'streak',
        points: 75
      },
      {
        id: 'streak_30',
        name: 'Unstoppable',
        description: 'Maintain a 30-day study streak',
        icon: '🚀',
        category: 'streak',
        points: 300
      },
      {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Study before 8 AM',
        icon: '🌅',
        category: 'habit',
        points: 20
      },
      {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Study after 10 PM',
        icon: '🦉',
        category: 'habit',
        points: 20
      },
      {
        id: 'weekend_warrior',
        name: 'Weekend Warrior',
        description: 'Study on both weekend days',
        icon: '💪',
        category: 'habit',
        points: 25
      },
      {
        id: 'category_master_java',
        name: 'Java Master',
        description: 'Complete all Java questions',
        icon: '☕',
        category: 'mastery',
        points: 100
      },
      {
        id: 'category_master_selenium',
        name: 'Selenium Expert',
        description: 'Complete all Selenium questions',
        icon: '🌐',
        category: 'mastery',
        points: 100
      },
      {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Complete a week in 3 days',
        icon: '⚡',
        category: 'special',
        points: 150
      },
      {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Complete all tasks in a day',
        icon: '✨',
        category: 'special',
        points: 50
      }
    ];

    // Mark unlocked achievements
    const unlockedIds = new Set(
      (progress.achievements || []).map(a => a.id)
    );

    return allAchievements.map(achievement => ({
      ...achievement,
      unlocked: unlockedIds.has(achievement.id),
      unlockedAt: progress.achievements?.find(a => a.id === achievement.id)?.unlockedAt
    }));
  }

  /**
   * Get study goals progress
   */
  getStudyGoals(progress, user) {
    const today = new Date().toISOString().split('T')[0];
    const thisWeek = this.getWeekNumber(new Date());
    
    // Daily goal
    const studiedToday = !!progress.completedDays[today];
    const dailyGoal = {
      target: 1,
      current: studiedToday ? 1 : 0,
      percentage: studiedToday ? 100 : 0,
      completed: studiedToday
    };

    // Weekly goal
    const daysThisWeek = Object.keys(progress.completedDays || {})
      .filter(day => {
        const date = new Date(day);
        return this.getWeekNumber(date) === thisWeek;
      }).length;
    
    const weeklyGoal = {
      target: 5,
      current: daysThisWeek,
      percentage: Math.round((daysThisWeek / 5) * 100),
      completed: daysThisWeek >= 5
    };

    // Monthly goal
    const thisMonth = new Date().getMonth();
    const daysThisMonth = Object.keys(progress.completedDays || {})
      .filter(day => {
        const date = new Date(day);
        return date.getMonth() === thisMonth;
      }).length;
    
    const monthlyGoal = {
      target: 20,
      current: daysThisMonth,
      percentage: Math.round((daysThisMonth / 20) * 100),
      completed: daysThisMonth >= 20
    };

    return {
      daily: dailyGoal,
      weekly: weeklyGoal,
      monthly: monthlyGoal
    };
  }

  /**
   * Get time analytics
   */
  getTimeAnalytics(progress) {
    const stats = progress.statistics || {};
    const sessions = progress.studySessions || [];

    // Calculate study time by day of week
    const timeByDayOfWeek = this.calculateTimeByDayOfWeek(sessions);
    
    // Calculate study time by hour
    const timeByHour = this.calculateTimeByHour(sessions);
    
    // Calculate average session duration
    const avgSessionDuration = stats.totalSessions > 0
      ? Math.round(stats.totalStudyTime / stats.totalSessions)
      : 0;

    // Get most productive time
    const mostProductiveTime = this.getMostProductiveTime(timeByHour);

    return {
      totalStudyTime: stats.totalStudyTime || 0,
      totalSessions: stats.totalSessions || 0,
      averageSessionTime: avgSessionDuration,
      longestSession: this.getLongestSession(sessions),
      timeByDayOfWeek,
      timeByHour,
      mostProductiveTime,
      studyTimeGoal: 120, // 2 hours per day
      studyTimeProgress: Math.min(100, Math.round((stats.totalStudyTime / 120) * 100))
    };
  }

  /**
   * Get recent activity
   */
  getRecentActivity(progress) {
    const activities = [];

    // Recent completed days
    const recentDays = Object.entries(progress.completedDays || {})
      .sort((a, b) => new Date(b[1].completedAt) - new Date(a[1].completedAt))
      .slice(0, 5);

    recentDays.forEach(([dayKey, data]) => {
      activities.push({
        type: 'day_completed',
        title: `Completed Day ${dayKey}`,
        timestamp: data.completedAt,
        icon: '✅'
      });
    });

    // Recent studied questions
    const recentQuestions = progress.studiedQuestions?.slice(-5) || [];
    recentQuestions.forEach(qId => {
      activities.push({
        type: 'question_studied',
        title: `Studied question: ${this.getQuestionTitle(qId)}`,
        timestamp: new Date().toISOString(),
        icon: '📚'
      });
    });

    // Recent achievements
    const recentAchievements = (progress.achievements || [])
      .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
      .slice(0, 3);

    recentAchievements.forEach(achievement => {
      activities.push({
        type: 'achievement_unlocked',
        title: `Unlocked: ${achievement.name}`,
        timestamp: achievement.unlockedAt,
        icon: achievement.icon
      });
    });

    // Sort by timestamp and return top 10
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
  }

  /**
   * Get upcoming milestones
   */
  getUpcomingMilestones(progress) {
    const milestones = [];
    const stats = progress.statistics || {};

    // Days milestone
    const daysCompleted = stats.daysCompleted || 0;
    const nextDayMilestone = this.getNextMilestone(daysCompleted, [7, 14, 21, 30]);
    if (nextDayMilestone) {
      milestones.push({
        type: 'days',
        title: `${nextDayMilestone} Days Completed`,
        current: daysCompleted,
        target: nextDayMilestone,
        percentage: Math.round((daysCompleted / nextDayMilestone) * 100),
        icon: '📅'
      });
    }

    // Questions milestone
    const questionsStudied = stats.questionsStudied || 0;
    const nextQuestionMilestone = this.getNextMilestone(questionsStudied, [25, 50, 100, 150, 200, 250]);
    if (nextQuestionMilestone) {
      milestones.push({
        type: 'questions',
        title: `${nextQuestionMilestone} Questions Studied`,
        current: questionsStudied,
        target: nextQuestionMilestone,
        percentage: Math.round((questionsStudied / nextQuestionMilestone) * 100),
        icon: '📚'
      });
    }

    // Streak milestone
    const currentStreak = progress.streak?.current || 0;
    const nextStreakMilestone = this.getNextMilestone(currentStreak, [5, 10, 15, 21, 30]);
    if (nextStreakMilestone) {
      milestones.push({
        type: 'streak',
        title: `${nextStreakMilestone}-Day Streak`,
        current: currentStreak,
        target: nextStreakMilestone,
        percentage: Math.round((currentStreak / nextStreakMilestone) * 100),
        icon: '🔥'
      });
    }

    return milestones;
  }

  /**
   * Get motivational message
   */
  getMotivation(progress) {
    const messages = [
      {
        text: "Every expert was once a beginner. Keep going! 🌟",
        condition: () => true
      },
      {
        text: "You're on fire! 🔥 Keep that streak alive!",
        condition: () => (progress.streak?.current || 0) >= 3
      },
      {
        text: "Consistency is key. You're building great habits! 💪",
        condition: () => (progress.statistics?.daysCompleted || 0) >= 7
      },
      {
        text: "Halfway there! The finish line is in sight! 🎯",
        condition: () => {
          const completion = this.getOverview(progress, {}).completionRate;
          return completion >= 50 && completion < 75;
        }
      },
      {
        text: "Almost done! You've got this! 🚀",
        condition: () => {
          const completion = this.getOverview(progress, {}).completionRate;
          return completion >= 75;
        }
      },
      {
        text: "Knowledge is power. You're becoming unstoppable! ⚡",
        condition: () => (progress.studiedQuestions?.length || 0) >= 50
      },
      {
        text: "Your dedication is inspiring! Keep up the amazing work! ✨",
        condition: () => (progress.achievements?.length || 0) >= 5
      }
    ];

    // Find applicable messages
    const applicableMessages = messages.filter(m => m.condition());
    
    // Return random applicable message
    const randomMessage = applicableMessages[
      Math.floor(Math.random() * applicableMessages.length)
    ];

    return {
      message: randomMessage.text,
      timestamp: new Date().toISOString()
    };
  }

  // Helper methods

  getTrackData(track) {
    const tracks = {
      fast: { totalDays: 60, weeksPerDay: 5 },
      standard: { totalDays: 90, weeksPerDay: 5 },
      comfortable: { totalDays: 120, weeksPerDay: 5 }
    };
    return tracks[track] || tracks.standard;
  }

  getCurrentWeek(completedDays, trackData) {
    return Math.floor(completedDays / trackData.weeksPerDay) + 1;
  }

  calculateEstimatedCompletion(completed, total, sessions) {
    if (sessions.length < 3) return null;

    // Calculate average days per week
    const recentSessions = sessions.slice(-14); // Last 2 weeks
    const daysPerWeek = recentSessions.length / 2;
    
    const remaining = total - completed;
    const weeksRemaining = Math.ceil(remaining / daysPerWeek);
    
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + (weeksRemaining * 7));
    
    return estimatedDate.toISOString().split('T')[0];
  }

  getWeekStatus(completed, total) {
    const percentage = (completed / total) * 100;
    if (percentage === 100) return 'completed';
    if (percentage >= 60) return 'on-track';
    if (percentage > 0) return 'in-progress';
    return 'not-started';
  }

  isOnStreak(lastStudyDate) {
    if (!lastStudyDate) return false;
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    return lastStudyDate === today || lastStudyDate === yesterday;
  }

  calculateStreakPercentile(currentStreak) {
    // Simplified percentile calculation
    if (currentStreak >= 30) return 99;
    if (currentStreak >= 21) return 95;
    if (currentStreak >= 14) return 85;
    if (currentStreak >= 7) return 70;
    if (currentStreak >= 3) return 50;
    return 25;
  }

  getStreakHistory(sessions) {
    // Calculate streak over last 30 days
    const history = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const sessionsOnDay = sessions.filter(s => 
        s.startedAt.startsWith(dateStr)
      ).length;
      
      history.push({
        date: dateStr,
        sessions: sessionsOnDay,
        studied: sessionsOnDay > 0
      });
    }
    return history;
  }

  calculateTimeByDayOfWeek(sessions) {
    const timeByDay = Array(7).fill(0);
    
    sessions.forEach(session => {
      const date = new Date(session.startedAt);
      const dayOfWeek = date.getDay();
      timeByDay[dayOfWeek] += session.duration;
    });

    return timeByDay.map((time, index) => ({
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index],
      minutes: time
    }));
  }

  calculateTimeByHour(sessions) {
    const timeByHour = Array(24).fill(0);
    
    sessions.forEach(session => {
      const date = new Date(session.startedAt);
      const hour = date.getHours();
      timeByHour[hour] += session.duration;
    });

    return timeByHour.map((time, hour) => ({
      hour,
      minutes: time
    }));
  }

  getMostProductiveTime(timeByHour) {
    let maxTime = 0;
    let maxHour = 0;
    
    timeByHour.forEach(({ hour, minutes }) => {
      if (minutes > maxTime) {
        maxTime = minutes;
        maxHour = hour;
      }
    });

    return {
      hour: maxHour,
      period: maxHour < 12 ? 'Morning' : maxHour < 17 ? 'Afternoon' : 'Evening',
      minutes: maxTime
    };
  }

  getLongestSession(sessions) {
    if (sessions.length === 0) return 0;
    return Math.max(...sessions.map(s => s.duration));
  }

  getNextMilestone(current, milestones) {
    return milestones.find(m => m > current) || null;
  }

  getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  getQuestionCategory(questionId) {
    // Extract category from question ID
    // Format: category_number (e.g., "java_1", "selenium_5")
    return questionId.split('_')[0];
  }

  getQuestionTitle(questionId) {
    // This would fetch from database in real implementation
    return `Question ${questionId}`;
  }
}

module.exports = new DashboardService();
```

---

## 🎨 Frontend Dashboard Components

### React Dashboard Component

```jsx
// src/components/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService } from '../../services/api';
import OverviewCards from './OverviewCards';
import StreakCalendar from './StreakCalendar';
import WeeklyProgress from './WeeklyProgress';
import CategoryProgress from './CategoryProgress';
import Achievements from './Achievements';
import StudyGoals from './StudyGoals';
import TimeAnalytics from './TimeAnalytics';
import RecentActivity from './RecentActivity';
import MotivationCard from './MotivationCard';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="dashboard-error">Error: {error}</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome back, {user.name}! 👋</h1>
        <p className="dashboard-subtitle">
          Here's your learning progress
        </p>
      </header>

      {/* Overview Cards */}
      <OverviewCards data={dashboardData.overview} />

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-column">
          <StreakCalendar data={dashboardData.streak} />
          <WeeklyProgress data={dashboardData.weeklyBreakdown} />
          <CategoryProgress data={dashboardData.categoryProgress} />
        </div>

        {/* Right Column */}
        <div className="dashboard-column">
          <StudyGoals data={dashboardData.studyGoals} />
          <TimeAnalytics data={dashboardData.timeAnalytics} />
          <Achievements data={dashboardData.achievements} />
          <RecentActivity data={dashboardData.recentActivity} />
          <MotivationCard data={dashboardData.motivation} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
```

### Streak Calendar Component

```jsx
// src/components/Dashboard/StreakCalendar.jsx
import React from 'react';
import './StreakCalendar.css';

const StreakCalendar = ({ data }) => {
  const { current, longest, calendar } = data;

  return (
    <div className="streak-calendar-card">
      <h3>🔥 Study Streak</h3>
      
      <div className="streak-stats">
        <div className="streak-stat">
          <div className="streak-number">{current}</div>
          <div className="streak-label">Current Streak</div>
        </div>
        <div className="streak-stat">
          <div className="streak-number">{longest}</div>
          <div className="streak-label">Longest Streak</div>
        </div>
      </div>

      <div className="calendar-grid">
        {calendar.map((day, index) => (
          <div
            key={index}
            className={`calendar-day ${day.studied ? 'studied' : ''} ${
              day.isToday ? 'today' : ''
            }`}
            title={day.date}
          >
            {day.studied && '✓'}
          </div>
        ))}
      </div>

      <div className="calendar-legend">
        <span><span className="legend-box studied"></span> Studied</span>
        <span><span className="legend-box"></span> Missed</span>
        <span><span className="legend-box today"></span> Today</span>
      </div>
    </div>
  );
};

export default StreakCalendar;
```

### Category Progress Component

```jsx
// src/components/Dashboard/CategoryProgress.jsx
import React from 'react';
import './CategoryProgress.css';

const CategoryProgress = ({ data }) => {
  return (
    <div className="category-progress-card">
      <h3>📊 Category Progress</h3>
      
      <div className="categories-list">
        {data.map(category => (
          <div key={category.id} className="category-item">
            <div className="category-header">
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
              <span className="category-stats">
                {category.studied}/{category.total}
              </span>
            </div>
            
            <div className="category-progress-bar">
              <div
                className="category-progress-fill"
                style={{
                  width: `${category.percentage}%`,
                  backgroundColor: category.color
                }}
              />
            </div>
            
            <div className="category-percentage">
              {category.percentage}% Complete
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryProgress;
```

---

## 📱 API Endpoints

### Dashboard Routes

**File**: `src/routes/dashboard.js`

```javascript
const express = require('express');
const router = express.Router();
const dashboardService = require('../services/dashboardService');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   GET /api/dashboard
 * @desc    Get complete dashboard data
 * @access  Private
 */
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const data = await dash