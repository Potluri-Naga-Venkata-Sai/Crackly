"use client";

import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Video, VideoOff, Brain, AlertTriangle } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useParams } from "next/navigation";

export default function InterviewRoom() {
  const params = useParams();
  const [isVideoOn, setIsVideoOn] = useState(true);
  const { transcript, isListening, startListening, stopListening } = useSpeechRecognition();
  const webcamRef = useRef<Webcam>(null);

  // Simulated AI Interviewer State
  const [currentQuestion, setCurrentQuestion] = useState("Could you tell me about a time you had to optimize a slow-performing application?");
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);

  // Simulated MediaPipe Head Tracking
  useEffect(() => {
    // In a real implementation, we would initialize MediaPipe Face Mesh here
    // and analyze the video stream from webcamRef.current.video
    
    // Simulate a looking away warning after 10 seconds for demonstration
    const timer = setTimeout(() => {
      setWarnings(prev => [...prev, "Please maintain eye contact with the screen."]);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleSpeak = () => {
    if (isListening) {
      stopListening();
      // Here we would send `transcript` to the FastAPI/Groq backend
      console.log("Sending transcript to backend:", transcript);
    } else {
      startListening();
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col lg:flex-row p-4 gap-4">
      {/* Left Column: Interviewer AI and Questions */}
      <div className="flex-1 flex flex-col gap-4">
        <Card className="glass-panel flex-1 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-violet-500/10 opacity-50" />
          
          <div className={`relative w-32 h-32 mb-8 rounded-full flex items-center justify-center bg-black/50 border-4 ${aiSpeaking ? 'border-blue-500 animate-pulse' : 'border-border'}`}>
            <Brain className={`w-16 h-16 ${aiSpeaking ? 'text-blue-400' : 'text-muted-foreground'}`} />
          </div>

          <div className="relative z-10 max-w-xl">
            <h3 className="text-sm font-medium text-blue-400 uppercase tracking-widest mb-4">Question 1 of 5</h3>
            <p className="text-2xl font-semibold leading-relaxed">"{currentQuestion}"</p>
          </div>
        </Card>

        {/* Live Transcript / AI Feedback Box */}
        <Card className="glass h-48 flex flex-col">
          <div className="p-4 border-b border-border bg-card/50 flex justify-between items-center">
            <h4 className="font-medium flex items-center gap-2">
              <Mic className="w-4 h-4 text-emerald-500" />
              Live Transcript
            </h4>
            {isListening && (
              <span className="text-xs text-emerald-400 font-medium animate-pulse">Recording...</span>
            )}
          </div>
          <CardContent className="flex-1 p-4 overflow-y-auto font-mono text-sm text-muted-foreground">
            {transcript || "Your answer will appear here..."}
          </CardContent>
        </Card>
      </div>

      {/* Right Column: User Webcam & Controls */}
      <div className="w-full lg:w-[400px] flex flex-col gap-4">
        <Card className="glass overflow-hidden relative aspect-[4/3] lg:aspect-auto lg:h-[300px]">
          {isVideoOn ? (
            <Webcam
              ref={webcamRef}
              audio={false}
              mirrored={true}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-black/80">
              <VideoOff className="w-12 h-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Camera Disabled</p>
            </div>
          )}
          
          {/* Tracking Indicators */}
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            <div className="px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] font-medium flex items-center gap-1 border border-border">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              Face Detected
            </div>
          </div>
        </Card>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive-foreground p-3 rounded-lg flex flex-col gap-2">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4" />
              Attention
            </div>
            <ul className="text-xs list-disc list-inside">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Controls */}
        <Card className="glass p-4 mt-auto">
          <div className="flex justify-center gap-4">
            <Button
              variant={isVideoOn ? "secondary" : "destructive"}
              size="icon"
              className="rounded-full w-12 h-12"
              onClick={() => setIsVideoOn(!isVideoOn)}
            >
              {isVideoOn ? <Video /> : <VideoOff />}
            </Button>
            <Button
              variant={isListening ? "destructive" : "secondary"}
              size="icon"
              className={`rounded-full w-12 h-12 ${isListening ? 'animate-pulse' : ''}`}
              onClick={handleSpeak}
            >
              {isListening ? <MicOff /> : <Mic />}
            </Button>
          </div>
          <div className="mt-6 flex justify-between">
            <Button variant="outline" className="w-[48%]">Skip Question</Button>
            <Button className="w-[48%] bg-blue-600 hover:bg-blue-700">Submit Answer</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
