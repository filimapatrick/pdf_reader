"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Pause, StopCircle, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TextToSpeechProps {
  text: string;
}

export function TextToSpeech({ text }: TextToSpeechProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const synth = useRef<SpeechSynthesis | null>(null);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const previousVolume = useRef(volume);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load available voices
  useEffect(() => {
    if (typeof window !== "undefined") {
      synth.current = window.speechSynthesis;
      
      // Initial voices load (for Chrome)
      let voicesList = synth.current.getVoices();
      if (voicesList.length > 0) {
        setVoices(voicesList);
        // Set default voice
        setSelectedVoice(voicesList[0].voiceURI);
      }
      
      // For Firefox and other browsers that load voices asynchronously
      const voicesChanged = () => {
        const newVoices = synth.current?.getVoices() || [];
        setVoices(newVoices);
        if (newVoices.length > 0 && !selectedVoice) {
          setSelectedVoice(newVoices[0].voiceURI);
        }
      };

      synth.current.onvoiceschanged = voicesChanged;
      
      return () => {
        if (synth.current) {
          synth.current.cancel();
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      };
    }
  }, []);

  // Handle text-to-speech state
  useEffect(() => {
    if (!text || !synth.current) return;

    // Create new utterance when text changes
    utterance.current = new SpeechSynthesisUtterance(text);
    utterance.current.volume = volume;
    
    // Set voice if available
    if (selectedVoice) {
      const voice = voices.find(v => v.voiceURI === selectedVoice);
      if (voice) utterance.current.voice = voice;
    }

    // Track progress
    utterance.current.onboundary = (event) => {
      if (event.name === 'word') {
        const totalLength = text.length;
        const position = event.charIndex;
        setProgress(Math.floor((position / totalLength) * 100));
      }
    };

    // Handle speech end
    utterance.current.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };

    // Cancel any existing speech when text changes
    stopSpeech();

    return () => {
      stopSpeech();
    };
  }, [text, selectedVoice, voices]);

  // Handle volume change
  useEffect(() => {
    if (utterance.current) {
      utterance.current.volume = volume;
    }
  }, [volume]);

  const startSpeech = useCallback(() => {
    if (!text || !synth.current || !utterance.current) return;
    
    // Cancel any ongoing speech
    synth.current.cancel();
    
    // Create a new utterance if needed
    if (!utterance.current || utterance.current.text !== text) {
      utterance.current = new SpeechSynthesisUtterance(text);
      utterance.current.volume = volume;
      
      if (selectedVoice) {
        const voice = voices.find(v => v.voiceURI === selectedVoice);
        if (voice) utterance.current.voice = voice;
      }
      
      utterance.current.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setProgress(0);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
    
    synth.current.speak(utterance.current);
    setIsPlaying(true);
    setIsPaused(false);
    
    // Set up progress tracking as a fallback for browsers that don't support boundary events
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Approximate progress based on time - not perfect but works across browsers
    const speechDuration = (text.length / 5) * 60; // Rough estimate: 5 chars per second
    let startTime = Date.now();
    
    intervalRef.current = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const estimatedProgress = Math.min(100, Math.floor((elapsedTime / speechDuration) * 100));
      if (!isPaused) {
        setProgress(estimatedProgress);
      }
      
      if (estimatedProgress >= 100) {
        clearInterval(intervalRef.current!);
      }
    }, 100);
    
  }, [text, volume, selectedVoice, voices, isPaused]);

  const pauseSpeech = useCallback(() => {
    if (!synth.current) return;
    
    synth.current.pause();
    setIsPaused(true);
  }, []);

  const resumeSpeech = useCallback(() => {
    if (!synth.current) return;
    
    synth.current.resume();
    setIsPaused(false);
  }, []);

  const stopSpeech = useCallback(() => {
    if (!synth.current) return;
    
    synth.current.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      setVolume(previousVolume.current);
    } else {
      previousVolume.current = volume;
      setVolume(0);
    }
    setIsMuted(!isMuted);
  }, [isMuted, volume]);

  // Early return if no text is available
  if (!text) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-muted/20 rounded-lg">
        <p className="text-muted-foreground text-center">
          Select a page to view text
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {!isPlaying ? (
            <Button 
              onClick={startSpeech} 
              variant="default" 
              size="sm"
              disabled={!text}
              aria-label="Play"
            >
              <Play className="h-4 w-4 mr-2" />
              Play
            </Button>
          ) : isPaused ? (
            <Button 
              onClick={resumeSpeech} 
              variant="default"
              size="sm"
              aria-label="Resume"
            >
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          ) : (
            <Button 
              onClick={pauseSpeech} 
              variant="default"
              size="sm"
              aria-label="Pause"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}
          
          <Button 
            onClick={stopSpeech} 
            variant="secondary"
            size="sm"
            disabled={!isPlaying}
            aria-label="Stop"
          >
            <StopCircle className="h-4 w-4 mr-2" />
            Stop
          </Button>
        </div>
        
        <div className="flex items-center gap-3 ml-auto">
          <Button
            onClick={toggleMute}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          
          <div className="w-24 hidden sm:block">
            <Slider
              value={[volume * 100]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => {
                const newVolume = value[0] / 100;
                setVolume(newVolume);
                setIsMuted(newVolume === 0);
              }}
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <Progress value={progress} className="w-full h-2" />
        
        <div className="flex justify-between items-center mt-2">
          <Select
            value={selectedVoice}
            onValueChange={setSelectedVoice}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="text-xs text-muted-foreground">
            {progress}% complete
          </div>
        </div>
      </div>
    </div>
  );
}