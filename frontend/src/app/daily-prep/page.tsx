"use client";

import { useState, useEffect } from "react";
import { Sparkles, Building2, CalendarDays, Loader2, ArrowRight, Play, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Task {
  id: string;
  type: "Coding" | "System Design" | "Behavioral" | "Theory";
  description: string;
  completed: boolean;
  problemData?: any;
}

interface DayPlan {
  day: number;
  title: string;
  focus: string;
  tasks: Task[];
}

const codingMocks = [
  { 
    title: "Two Sum", 
    topic: "Arrays", 
    difficulty: "Easy", 
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.", 
    company: "Google",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." }
    ],
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"]
  },
  { 
    title: "LRU Cache", 
    topic: "Design", 
    difficulty: "Medium", 
    description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.", 
    company: "Amazon",
    examples: [
      { input: "[\"LRUCache\", \"put\", \"put\", \"get\"]\n[[2], [1, 1], [2, 2], [1]]", output: "[null, null, null, 1]", explanation: "LRUCache is initialized with capacity 2. Put (1,1). Put (2,2). Get(1) returns 1." }
    ],
    constraints: ["1 <= capacity <= 3000", "0 <= key <= 10000", "0 <= value <= 10^5"]
  },
  { 
    title: "Merge Intervals", 
    topic: "Arrays", 
    difficulty: "Medium", 
    description: "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals.", 
    company: "Meta",
    examples: [
      { input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]", explanation: "Since intervals [1,3] and [2,6] overlap, merge them into [1,6]." }
    ],
    constraints: ["1 <= intervals.length <= 10^4", "intervals[i].length == 2", "0 <= starti <= endi <= 10^4"]
  },
  { 
    title: "Trapping Rain Water", 
    topic: "Arrays", 
    difficulty: "Hard", 
    description: "Given n non-negative integers representing an elevation map, compute how much water it can trap after raining.", 
    company: "Apple",
    examples: [
      { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6", explanation: "The above elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped." }
    ],
    constraints: ["n == height.length", "1 <= n <= 2 * 10^4", "0 <= height[i] <= 10^5"]
  },
  { 
    title: "Valid Parentheses", 
    topic: "Stacks", 
    difficulty: "Easy", 
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.", 
    company: "Netflix",
    examples: [
      { input: "s = \"()[]{}\"", output: "true", explanation: "Every opening bracket is correctly closed." },
      { input: "s = \"(]\"", output: "false", explanation: "The opening bracket '(' is closed by an invalid type ']'." }
    ],
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'."]
  },
  { 
    title: "Word Search", 
    topic: "Backtracking", 
    difficulty: "Medium", 
    description: "Given an m x n grid of characters board and a string word, return true if word exists in the grid.", 
    company: "Uber",
    examples: [
      { input: "board = [[\"A\",\"B\",\"C\",\"E\"],[\"S\",\"F\",\"C\",\"S\"],[\"A\",\"D\",\"E\",\"E\"]], word = \"ABCCED\"", output: "true", explanation: "The word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring." }
    ],
    constraints: ["m == board.length", "n = board[i].length", "1 <= m, n <= 6", "1 <= word.length <= 15"]
  },
  { 
    title: "Number of Islands", 
    topic: "Graphs", 
    difficulty: "Medium", 
    description: "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.", 
    company: "LinkedIn",
    examples: [
      { input: "grid = [[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"1\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"1\",\"1\"]]", output: "3", explanation: "An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically." }
    ],
    constraints: ["m == grid.length", "n == grid[i].length", "1 <= m, n <= 300", "grid[i][j] is '0' or '1'."]
  },
  { 
    title: "Median of Two Sorted Arrays", 
    topic: "Binary Search", 
    difficulty: "Hard", 
    description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.", 
    company: "Google",
    examples: [
      { input: "nums1 = [1,3], nums2 = [2]", output: "2.00000", explanation: "merged array = [1,2,3] and median is 2." }
    ],
    constraints: ["nums1.length == m", "nums2.length == n", "0 <= m <= 1000", "0 <= n <= 1000", "1 <= m + n <= 2000"]
  }
];

const behavioralMocks = [
  "Tell me about a time you had a conflict with a coworker.",
  "Describe a situation where you had to meet a tight deadline.",
  "What is your greatest weakness and how do you manage it?",
  "Tell me about a time you failed and what you learned.",
  "How do you prioritize multiple tasks?",
  "Describe a time you went above and beyond for a project.",
  "Tell me about a time you had to learn a new technology quickly.",
  "How do you handle negative feedback?",
  "Describe a time you showed leadership without a formal title.",
  "Tell me about your most complex technical challenge."
];

const systemDesignMocks = [
  "Design a scalable rate limiter.",
  "Design WhatsApp / a chat application.",
  "Design a URL shortener (like bit.ly).",
  "Design Twitter (news feed & posting).",
  "Design a key-value store.",
  "Design YouTube / Netflix (video streaming).",
  "Design Google Drive / Dropbox.",
  "Design an autocomplete system.",
  "Design a distributed message queue (like Kafka).",
  "Design Uber / Lyft (ride-sharing)."
];

export default function DailyPrepPage() {
  const router = useRouter();
  const [company, setCompany] = useState("");
  const [duration, setDuration] = useState("30");
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<DayPlan[] | null>(null);

  // If the user navigates back to /daily-prep via the sidebar, reset the state
  useEffect(() => {
    const handlePopState = () => setPlan(null);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    setGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const numDays = parseInt(duration);
      const generatedPlan: DayPlan[] = Array.from({ length: numDays }).map((_, i) => {
        const cMock = codingMocks[i % codingMocks.length];
        const bMock = behavioralMocks[i % behavioralMocks.length];
        const sMock = systemDesignMocks[i % systemDesignMocks.length];

        const isSystemDesignDay = i % 3 === 0;

        return {
          day: i + 1,
          title: `Day ${i + 1}: ${i < 7 ? "Foundation & Arrays" : i < 14 ? "System Design Basics" : i < 21 ? "Advanced Algorithms" : "Mock Interviews & Review"}`,
          focus: "Previous year questions",
          tasks: [
            { 
              id: `task-${i}-1`,
              type: "Coding", 
              description: `Solve: ${cMock.title} (Frequently asked by ${company}).`, 
              completed: false,
              problemData: { ...cMock, company }
            },
            { 
              id: `task-${i}-2`,
              type: isSystemDesignDay ? "System Design" : "Behavioral", 
              description: isSystemDesignDay ? sMock : bMock, 
              completed: false 
            }
          ]
        };
      });
      setPlan(generatedPlan);
      setGenerating(false);
    }, 2500);
  };

  const toggleTaskCompletion = (dayIndex: number, taskId: string) => {
    if (!plan) return;
    const newPlan = [...plan];
    const task = newPlan[dayIndex].tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      setPlan(newPlan);
    }
  };

  const handleStartTask = (task: Task) => {
    if (task.type === "Coding" && task.problemData) {
      sessionStorage.setItem("current_coding_problem", JSON.stringify(task.problemData));
      router.push("/coding/practice");
    } else {
      // For Behavioral and System Design, direct to interview module with parameters
      router.push(`/interview?start=true&company=${company || "Tech"}&role=${encodeURIComponent(task.type + ": " + task.description)}`);
    }
  };

  // Calculate Progress
  const totalTasks = plan ? plan.reduce((acc, day) => acc + day.tasks.length, 0) : 0;
  const completedTasks = plan ? plan.reduce((acc, day) => acc + day.tasks.filter(t => t.completed).length, 0) : 0;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="flex-1 p-8 font-sans max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" />
          AI Study Planner
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Generate a highly optimized, day-by-day interview preparation syllabus based on previous year questions asked by your target company.
        </p>
      </div>

      {!plan ? (
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl max-w-2xl mx-auto mt-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20" />
          
          <form onSubmit={handleGenerate} className="relative z-10 space-y-6">
            <div>
              <label className="text-sm font-bold text-foreground uppercase tracking-wider mb-2 block">Target Company</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input 
                  type="text" 
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-lg font-medium"
                  placeholder="e.g. Google, Amazon, Meta"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-foreground uppercase tracking-wider mb-2 block">Preparation Timeline</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => setDuration("7")}
                  className={`border rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                    duration === "7" 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-border bg-background text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <CalendarDays className="h-6 w-6" />
                  <span className="font-bold">7-Day Crash Course</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setDuration("30")}
                  className={`border rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                    duration === "30" 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-border bg-background text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <CalendarDays className="h-6 w-6" />
                  <span className="font-bold">30-Day Deep Dive</span>
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={generating || !company}
              className="w-full bg-primary hover:bg-primary/90 text-foreground font-bold py-6 text-lg rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-3 mt-4 transition-all hover:scale-[1.02]"
            >
              {generating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing {company} Interview Patterns...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate Custom Syllabus
                </>
              )}
            </Button>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-card border border-border rounded-xl p-6 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-foreground capitalize">{company} Prep Plan</h2>
              <p className="text-sm text-muted-foreground">{duration} Day Custom Syllabus</p>
            </div>
            
            {/* Progress Tracker */}
            <div className="flex-1 max-w-md mx-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-foreground">Progress</span>
                <span className="text-sm font-bold text-primary">{progressPercent}%</span>
              </div>
              <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden border border-border">
                <div 
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-right">{completedTasks} of {totalTasks} tasks completed</p>
            </div>

            <Button variant="outline" onClick={() => setPlan(null)}>
              Reset Plan
            </Button>
          </div>

          <div className="relative border-l-2 border-border ml-6 space-y-8 pb-12 mt-8">
            {plan.map((day, index) => (
              <div key={day.day} className="relative pl-8">
                <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-background border-2 border-primary" />
                
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{day.title}</h3>
                      <p className="text-sm text-muted-foreground">{day.focus}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {day.tasks.map((task) => (
                      <div 
                        key={task.id} 
                        className={`flex items-center justify-between bg-background border rounded-lg p-4 group transition-all ${
                          task.completed ? "border-emerald-500/30 opacity-70" : "border-border"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => toggleTaskCompletion(index, task.id)}
                            className="shrink-0 focus:outline-none"
                          >
                            <CheckCircle2 className={`h-5 w-5 transition-colors ${
                              task.completed ? "text-emerald-500" : "text-muted-foreground group-hover:text-emerald-500/50"
                            }`} />
                          </button>
                          <div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                              task.type === "Coding" ? "bg-blue-500/10 text-blue-500" :
                              task.type === "System Design" ? "bg-emerald-500/10 text-emerald-500" :
                              "bg-orange-500/10 text-orange-500"
                            }`}>
                              {task.type}
                            </span>
                            <p className={`text-sm mt-1 font-medium ${task.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                              {task.description}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleStartTask(task)}
                          className="flex items-center gap-1 text-primary hover:bg-primary/10"
                        >
                          Start <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
