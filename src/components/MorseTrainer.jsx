'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import MorseUI from './MorseUI';
import { morseAudio } from './MorseAudio';
import { MorseSequences } from './MorseSequences';
import { MorseSettings } from './MorseSettings';

const MorseTrainer = () => {
  const morseRef = useRef(new MorseSequences());
  const loadSettings = () => {
    const settings = MorseSettings.load();
    return {
      currentLevel: settings.currentLevel,
      wpm: settings.wpm,
      frequency: settings.frequency,
      groupSize: settings.groupSize,
      advanceThreshold: settings.advanceThreshold,
      headCopyMode: settings.headCopyMode,
      hideChars: settings.hideChars,
      qsbAmount: settings.qsbAmount || 0,
      qrmAmount: settings.qrmAmount || 0,
      currentPresetId: settings.currentPresetId || 'koch'
    };
  };

  const savedSettings = loadSettings();
  const [currentLevel, setCurrentLevel] = useState(savedSettings.currentLevel);
  const [wpm, setWpm] = useState(savedSettings.wpm);
  const [frequency, setFrequency] = useState(savedSettings.frequency);
  const [groupSize, setGroupSize] = useState(savedSettings.groupSize);
  const [advanceThreshold, setAdvanceThreshold] = useState(savedSettings.advanceThreshold);
  const [headCopyMode, setHeadCopyMode] = useState(savedSettings.headCopyMode);
  const [hideChars, setHideChars] = useState(savedSettings.hideChars);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentPreset, setCurrentPreset] = useState(morseRef.current.getCurrentPreset());

  const [currentGroupSize, setCurrentGroupSize] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [currentGroup, setCurrentGroup] = useState('');
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [history, setHistory] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [notification, setNotification] = useState('');
  const [qsbAmount, setQsbAmount] = useState(savedSettings.qsbAmount || 0);
  const [qrmAmount, setQrmAmount] = useState(savedSettings.qrmAmount || 0);
  const [isPaused, setIsPaused] = useState(false);

  const notificationTimeoutRef = useRef(null);

  useEffect(() => {
    morseAudio.initialize();
    setCurrentPreset(morseRef.current.getCurrentPreset());
    return () => {
      morseAudio.cleanup();
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    MorseSettings.save({
      currentLevel,
      wpm,
      frequency,
      groupSize,
      advanceThreshold,
      headCopyMode,
      hideChars,
      qsbAmount,
      qrmAmount,
      currentPresetId: currentPreset?.id
    });
  }, [currentLevel, wpm, frequency, groupSize, advanceThreshold, headCopyMode, hideChars, qsbAmount, qrmAmount, currentPreset]);

  const showNotification = useCallback((message, color = 'blue', duration = 2000) => {
    setNotification({ message, color });
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
      notificationTimeoutRef.current = null;
    }, duration);
  }, []);

  const startNewGroup = useCallback((level, delay = 0) => {
    const start = () => {
      const newGroup = morseRef.current.generateGroup(level, groupSize);
      setCurrentGroup(newGroup);
      setCurrentGroupSize(newGroup.length);
      setUserInput('');
      setShowAnswer(false);
      setIsPlaying(true);
      morseAudio.start();
      morseAudio.playSequence(newGroup, wpm);
    };

    if (delay > 0) {
      setTimeout(start, delay);
    } else {
      start();
    }
  }, [groupSize, wpm]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
        // Just pause the audio without resetting state
        morseAudio.stop();
        setIsPaused(true);
        showNotification('Audio paused - tab inactive', 'yellow', 2000);
      } else if (!document.hidden && isPaused && isPlaying) {
        // Resume playback if we were paused
        setIsPaused(false);
        startNewGroup(currentLevel, 500);
        showNotification('Audio resumed', 'blue', 2000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying, isPaused, currentLevel, showNotification, startNewGroup]);

  const updatePerformanceData = useCallback((isCorrect, level) => {
    setPerformanceData(prev => {
      const newData = [...prev];
      const timestamp = new Date().getTime();

      const lastTenAttempts = newData.slice(-9).concat([{ isCorrect }]);
      const rollingAccuracy = lastTenAttempts.reduce((acc, curr) =>
        acc + (curr.isCorrect ? 1 : 0), 0) / lastTenAttempts.length * 100;

      newData.push({
        timestamp,
        attempt: newData.length + 1,
        isCorrect,
        rollingAccuracy: Math.round(rollingAccuracy),
        level,
      });

      return newData.slice(-100);
    });
  }, []);

  const handleCharacterInput = useCallback((char) => {
    if (!isPlaying || notification) return;

    const newInput = userInput + char;
    setUserInput(newInput);

    const handleWrong = () => {
      setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
      setHistory(prev => [...prev, { group: currentGroup, userInput: newInput, correct: false }]);
      setConsecutiveCorrect(0);
      morseAudio.stop();
      setIsPlaying(false);

      if (currentLevel > 1) {
        const newLevel = currentLevel - 1;
        setCurrentLevel(newLevel);
        showNotification(`Level decreased to ${newLevel}`, 'red', 1500);
        startNewGroup(newLevel, 1500);
      } else {
        startNewGroup(currentLevel, 500);
      }
    };

    if (currentPreset.type === 'phrase') {
      if (newInput[newInput.length - 1] !== currentGroup[newInput.length - 1]) {
        handleWrong();
        return;
      }
    }

    if (newInput.length === currentGroup.length) {
      morseAudio.stop();
      setIsPlaying(false);

      const isCorrect = newInput === currentGroup;
      updatePerformanceData(isCorrect, currentLevel);

      if (isCorrect) {
        setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
        setHistory(prev => [...prev, { group: currentGroup, userInput: newInput, correct: true }]);

        const newConsecutiveCorrect = consecutiveCorrect + 1;
        setConsecutiveCorrect(newConsecutiveCorrect);

        if (newConsecutiveCorrect >= advanceThreshold && currentLevel < morseRef.current.getMaxLevel()) {
          const newLevel = currentLevel + 1;
          setCurrentLevel(newLevel);
          setConsecutiveCorrect(0);
          showNotification(`Level up! Now at level ${newLevel}`, 'blue', 1500);
          startNewGroup(newLevel, 1000);
        } else {
          startNewGroup(currentLevel, 500);
        }
      } else {
        handleWrong();
      }
    }
  }, [
    isPlaying, userInput, currentGroup, consecutiveCorrect, advanceThreshold,
    currentLevel, startNewGroup, showNotification, notification, updatePerformanceData,
    currentPreset, headCopyMode, showAnswer
  ]);

  const handleKeyPress = useCallback((e) => {
    if (!isPlaying || notification) return;

    const key = e.key.toUpperCase();
    // For character-based sequences, check if key is in available chars
    if (currentPreset.type === 'character') {
      const availableChars = morseRef.current.getAvailableChars(currentLevel);
      if (availableChars.includes(key)) {
        handleCharacterInput(key);
      }
    } else {
      // For phrase-based sequences, handle letter by letter input
      handleCharacterInput(key);
    }
  }, [isPlaying, handleCharacterInput, notification, headCopyMode, showAnswer]);

  useEffect(() => {
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [handleKeyPress]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      morseAudio.stop();
      setIsPlaying(false);
      setCurrentGroup('');
      setUserInput('');
      setHistory([]);
      setScore({ correct: 0, wrong: 0 });
      setConsecutiveCorrect(0);
      setCurrentGroupSize(0);
      setPerformanceData([]);
      setShowAnswer(false);
    } else {
      startNewGroup(currentLevel);
    }
  };

  const handleLevelChange = (delta) => {
    const newLevel = Math.max(1, Math.min(morseRef.current.getMaxLevel(), currentLevel + delta));
    if (newLevel !== currentLevel) {
      setCurrentLevel(newLevel);
      if (isPlaying) {
        morseAudio.stop();
        setIsPlaying(false);
        showNotification(`Level changed to ${newLevel}`, 'yellow', 3000);
        startNewGroup(newLevel, 3000);
      }
    }
  };

  const handleGroupSizeChange = (delta) => {
    const newSize = Math.max(1, Math.min(10, groupSize + delta));
    setGroupSize(newSize);
    if (isPlaying) {
      morseAudio.stop();
      startNewGroup(currentLevel, 500);
    }
  };

  const handleFrequencyChange = (delta) => {
    const newFreq = Math.max(400, Math.min(1000, frequency + delta));
    setFrequency(newFreq);
    morseAudio.setFrequency(newFreq);
  };

  const handleWpmChange = (delta) => {
    const newWpm = Math.max(5, Math.min(50, wpm + delta));
    setWpm(newWpm);
    if (isPlaying) {
      morseAudio.stop();
      startNewGroup(currentLevel, 500);
    }
  };

  const handleQsbChange = (delta) => {
    const newAmount = Math.max(0, Math.min(100, qsbAmount + delta));
    setQsbAmount(newAmount);
    morseAudio.setQsbAmount(newAmount);
  };

  const handleQrmChange = (delta) => {
    const newAmount = Math.max(0, Math.min(100, qrmAmount + delta));
    setQrmAmount(newAmount);
    morseAudio.setQrmAmount(newAmount);
  };

  const handleHeadCopyMode = () => {
    setHeadCopyMode(!headCopyMode);
    if (isPlaying) {
      morseAudio.stop();
      startNewGroup(currentLevel, 500);
    }
  };

  const handleHideChars = () => {
    setHideChars(!hideChars);
  };

  const handleShowAnswer = () => {
    if (headCopyMode && isPlaying) {
      setShowAnswer(true);
    }
  };

  const handleResetKoch = () => {
    morseRef.current.resetSequence();
    showNotification('Koch sequence reset', 'gray', 2000);
    if (isPlaying) {
      morseAudio.stop();
      startNewGroup(currentLevel, 500);
    }
  };

  const handlePresetChange = (presetId) => {
    morseRef.current.setPreset(presetId);
    setCurrentPreset(morseRef.current.getCurrentPreset());
    setCurrentLevel(1);
    setConsecutiveCorrect(0);
    showNotification(`Switched to ${morseRef.current.getCurrentPreset().name}`, 'blue', 2000);
    if (isPlaying) {
      morseAudio.stop();
      startNewGroup(1, 500);
    }
  };

  const handleAdvanceThresholdChange = (delta) => {
    const newThreshold = Math.max(1, Math.min(10, advanceThreshold + delta));
    setAdvanceThreshold(newThreshold);
  };

  return (
    <MorseUI
      isPlaying={isPlaying}
      onTogglePlay={handleTogglePlay}
      currentLevel={currentLevel}
      onLevelChange={handleLevelChange}
      groupSize={groupSize}
      onGroupSizeChange={handleGroupSizeChange}
      frequency={frequency}
      onFrequencyChange={handleFrequencyChange}
      wpm={wpm}
      onWpmChange={handleWpmChange}
      availableChars={morseRef.current.getAvailableChars(currentLevel)}
      consecutiveCorrect={consecutiveCorrect}
      userInput={userInput}
      currentGroupSize={currentGroupSize}
      score={score}
      history={history}
      maxLevel={morseRef.current.getMaxLevel()}
      notification={notification}
      onCharacterInput={handleCharacterInput}
      performanceData={performanceData}
      headCopyMode={headCopyMode}
      onHeadCopyMode={handleHeadCopyMode}
      hideChars={hideChars}
      onHideChars={handleHideChars}
      showAnswer={showAnswer}
      onShowAnswer={handleShowAnswer}
      currentGroup={headCopyMode && !showAnswer ? '' : currentGroup}
      onResetKoch={handleResetKoch}
      qsbAmount={qsbAmount}
      onQsbChange={handleQsbChange}
      qrmAmount={qrmAmount}
      onQrmChange={handleQrmChange}
      presets={morseRef.current.getPresets()}
      currentPreset={currentPreset}
      onPresetChange={handlePresetChange}
      advanceThreshold={advanceThreshold}
      onAdvanceThresholdChange={handleAdvanceThresholdChange}
    />
  );
};

export default MorseTrainer;