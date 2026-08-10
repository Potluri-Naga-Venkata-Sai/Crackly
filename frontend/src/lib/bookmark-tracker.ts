export interface Bookmark {
  id: string; // The problem title or unique identifier
  module: "Coding" | "System Design" | "Company Fit" | "Aptitude" | "Theory";
  title: string;
  timestamp: string;
  difficulty?: string;
  path: string; // the URL to jump back to
  problemData: any; // the actual problem object to inject into session storage
}

export function addBookmark(bookmark: Omit<Bookmark, "timestamp">) {
  if (typeof window === "undefined") return;
  try {
    const existingStr = localStorage.getItem("global_bookmarks");
    const existing: Bookmark[] = existingStr ? JSON.parse(existingStr) : [];
    
    // Avoid duplicates based on ID
    if (!existing.find(b => b.id === bookmark.id)) {
      const newBookmark = { ...bookmark, timestamp: new Date().toISOString() };
      localStorage.setItem("global_bookmarks", JSON.stringify([newBookmark, ...existing]));
      window.dispatchEvent(new Event("storage"));
    }
  } catch (err) {
    console.error("Failed to add bookmark", err);
  }
}

export function removeBookmark(id: string) {
  if (typeof window === "undefined") return;
  try {
    const existingStr = localStorage.getItem("global_bookmarks");
    const existing: Bookmark[] = existingStr ? JSON.parse(existingStr) : [];
    const updated = existing.filter(b => b.id !== id);
    localStorage.setItem("global_bookmarks", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  } catch (err) {
    console.error("Failed to remove bookmark", err);
  }
}

export function isBookmarked(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const existingStr = localStorage.getItem("global_bookmarks");
    if (!existingStr) return false;
    const existing: Bookmark[] = JSON.parse(existingStr);
    return existing.some(b => b.id === id);
  } catch {
    return false;
  }
}

export function getBookmarks(): Bookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const existingStr = localStorage.getItem("global_bookmarks");
    return existingStr ? JSON.parse(existingStr) : [];
  } catch {
    return [];
  }
}
