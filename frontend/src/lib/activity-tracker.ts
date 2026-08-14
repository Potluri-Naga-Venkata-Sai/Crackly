export interface ActivityLog {
  id: string;
  module: string;
  title: string;
  timestamp: string; // ISO string
  score?: string;
  description?: string;
}

export function logActivity(activity: Omit<ActivityLog, "id" | "timestamp">) {
  if (typeof window === "undefined") return;

  try {
    const existingStr = localStorage.getItem("global_activity_history");
    const existing: ActivityLog[] = existingStr ? JSON.parse(existingStr) : [];
    
    const newActivity: ActivityLog = {
      ...activity,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString()
    };

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const updated = [newActivity, ...existing].filter(act => new Date(act.timestamp) >= threeDaysAgo);
    
    localStorage.setItem("global_activity_history", JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

export function getActivities(): ActivityLog[] {
  if (typeof window === "undefined") return [];

  try {
    const existingStr = localStorage.getItem("global_activity_history");
    if (!existingStr) return [];
    
    const activities: ActivityLog[] = JSON.parse(existingStr);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    return activities.filter(act => new Date(act.timestamp) >= threeDaysAgo);
  } catch (error) {
    console.error("Failed to get activities:", error);
    return [];
  }
}

export function clearActivities() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("global_activity_history");
}

export function checkTrackCompletion(moduleKey: string, trackQuestions: any[], submissions: any[]) {
  if (typeof window === "undefined" || !trackQuestions || trackQuestions.length === 0) return;
  
  try {
    const trackId = `${moduleKey}_${trackQuestions.length}_${trackQuestions[0].title || trackQuestions[0].question}`;
    
    const allCompleted = trackQuestions.every(q => {
      const qTitle = q.title || q.question;
      return submissions.some(s => {
        const sTitle = s.problemTitle || s.title || s.question;
        return sTitle === qTitle;
      });
    });

    if (allCompleted) {
      const completedTracks = JSON.parse(localStorage.getItem("global_completed_tracks") || "[]");
      if (!completedTracks.includes(trackId)) {
        completedTracks.push(trackId);
        localStorage.setItem("global_completed_tracks", JSON.stringify(completedTracks));
        
        const counterKey = `${moduleKey}_completed_tracks`;
        localStorage.setItem(counterKey, (parseInt(localStorage.getItem(counterKey) || "0") + 1).toString());
      }
    }
  } catch (error) {
    console.error("Failed to check track completion:", error);
  }
}
