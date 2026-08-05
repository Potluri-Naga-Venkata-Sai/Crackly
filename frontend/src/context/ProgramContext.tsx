"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ProgramType = 
  | "Full Stack Development"
  | "Data Science"
  | "AI and Machine Learning"
  | "Generative AI"
  | "Competitive Coding";

interface ProgramContextType {
  program: ProgramType;
  setProgram: (program: ProgramType) => void;
}

const ProgramContext = createContext<ProgramContextType | undefined>(undefined);

export const ProgramProvider = ({ children }: { children: ReactNode }) => {
  const [program, setProgramState] = useState<ProgramType>("Full Stack Development");

  useEffect(() => {
    // Check if there's an intended program from the landing page
    const intended = sessionStorage.getItem("intended_program");
    if (intended) {
      setProgramState(intended as ProgramType);
      localStorage.setItem("skilltrixa_program", intended);
      sessionStorage.removeItem("intended_program");
      return;
    }

    // Load from localStorage on mount
    const saved = localStorage.getItem("skilltrixa_program");
    if (saved) {
      setProgramState(saved as ProgramType);
    }
  }, []);

  const setProgram = (newProgram: ProgramType) => {
    setProgramState(newProgram);
    localStorage.setItem("skilltrixa_program", newProgram);
  };

  return (
    <ProgramContext.Provider value={{ program, setProgram }}>
      {children}
    </ProgramContext.Provider>
  );
};

export const useProgram = () => {
  const context = useContext(ProgramContext);
  if (context === undefined) {
    throw new Error("useProgram must be used within a ProgramProvider");
  }
  return context;
};
