'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import MorseUI from './MorseUI';
import { morseAudio } from './MorseAudio';
import { MorseSequences } from './MorseSequences';
import { MorseSettings } from './MorseSettings';
import { useCustomAlphabet } from './CustomAlphabetManager';

const MorseTrainer = () => {
  const morseRef = useRef(new MorseSequences());
  const {
    customSequence,
    isModalOpen,
    setIsModalOpen,
    saveCustomSequence,
    CustomAlphabetModal
  } = useCustomAlphabet();

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
      currentPresetId: settings.currentPresetId || 'koch',
      progressiveSpeedMode: settings.progressiveSpeedMode || false,
      levelSpacing: settings.levelSpacing || 1000,
      transitionDelay: settings.transitionDelay || 500
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
  const [progressiveSpeedMode, setProgressiveSpeedMode] = useState(savedSettings.progressiveSpeedMode);
  const [levelSpacing, setLevelSpacing] = useState(savedSettings.levelSpacing);
  const [transitionDelay, setTransitionDelay] = useState(savedSettings.transitionDelay);

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
  const [farnsworthSpacing, setFarnsworthSpacing] = useState(savedSettings.farnsworthSpacing || 0);

  const notificationTimeoutRef = useRef(null);

  useEffect(() => {
    morseAudio.initialize();
    setCurrentPreset(morseRef.current.getCurrentPreset());

    if (customSequence) {
      morseRef.current.updateCustomSequence(customSequence);
    }

    return () => {
      morseAudio.cleanup();
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, [customSequence]);

  useEffect(() => {
    MorseSettings.save({
      currentLevel,
      wpm,
      frequency,
      farnsworthSpacing,
      groupSize,
      advanceThreshold,
      headCopyMode,
      hideChars,
      qsbAmount,
      qrmAmount,
      currentPresetId: currentPreset?.id,
      progressiveSpeedMode,
      levelSpacing,
      transitionDelay
    });
  }, [currentLevel, wpm, frequency, farnsworthSpacing, groupSize, advanceThreshold,
      headCopyMode, hideChars, qsbAmount, qrmAmount, currentPreset, progressiveSpeedMode,
      levelSpacing, transitionDelay]);

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

  const startNewGroup = useCallback((level, delay = null) => {
    const start = () => {
      const newGroup = morseRef.current.generateGroup(level, groupSize);
      setCurrentGroup(newGroup);
      setCurrentGroupSize(newGroup.length);
      setUserInput('');
      setShowAnswer(false);
      setIsPlaying(true);
      morseAudio.start();
      morseAudio.playSequence(newGroup, wpm, farnsworthSpacing, levelSpacing);
    };

    if (delay !== null) {
      setTimeout(start, delay);
    } else {
      start();
    }
  }, [groupSize, wpm, farnsworthSpacing, levelSpacing]);

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

  const handleProgressiveSpeedToggle = useCallback(() => {
    setProgressiveSpeedMode(prev => !prev);
  }, []);

  const updateLevelAndSpeed = useCallback((newLevel, isAutomatic = false) => {
    setCurrentLevel(newLevel);

    if (progressiveSpeedMode && isAutomatic) {
      const speedDelta = newLevel > currentLevel ? 1 : -1;
      const newWpm = Math.max(5, Math.min(50, wpm + speedDelta));
      setWpm(newWpm);

      if (isPlaying) {
        morseAudio.stop();
        showNotification(
          `Level ${newLevel}: Speed ${speedDelta > 0 ? 'increased' : 'decreased'} to ${newWpm} WPM`,
          speedDelta > 0 ? 'green' : 'yellow',
          transitionDelay
        );
        startNewGroup(newLevel, transitionDelay);
      }
    } else {
      if (isPlaying) {
        morseAudio.stop();
        showNotification(`Level changed to ${newLevel}`, 'yellow', 3000);
        startNewGroup(newLevel, transitionDelay);
      }
    }
  }, [progressiveSpeedMode, wpm, currentLevel, isPlaying, startNewGroup, showNotification, transitionDelay]);

  const handleLevelChange = (delta) => {
    const newLevel = Math.max(1, Math.min(morseRef.current.getMaxLevel(), currentLevel + delta));
    if (newLevel !== currentLevel) {
      updateLevelAndSpeed(newLevel, false);
    }
  };

  const handleLevelSpacingChange = (delta) => {
    const step = 500;
    const min = step;  // 500ms minimum
    const max = 5000;  // 5000ms maximum
    const newSpacing = Math.max(min, Math.min(max, levelSpacing + delta));
    setLevelSpacing(newSpacing);
    if (isPlaying) {
      morseAudio.stop();
      startNewGroup(currentLevel, transitionDelay);
    }
  };

  const handleTransitionDelayChange = (delta) => {
    const step = 100;
    const min = 200;   // 200ms minimum
    const max = 2000;  // 2000ms maximum
    const newDelay = Math.max(min, Math.min(max, transitionDelay + delta));
    setTransitionDelay(newDelay);
  };

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
        updateLevelAndSpeed(currentLevel - 1, true);
      } else {
        startNewGroup(currentLevel, transitionDelay);
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
          updateLevelAndSpeed(currentLevel + 1, true);
          setConsecutiveCorrect(0);
          if (progressiveSpeedMode) {
            const newWpm = wpm + 1;
            showNotification(`Level ${currentLevel + 1}: Speed increased to ${newWpm} WPM`, 'green', transitionDelay);
          } else {
            showNotification(`Level up! Now at level ${currentLevel + 1}`, 'blue', transitionDelay);
          }
        } else {
          startNewGroup(currentLevel, transitionDelay);
        }
      } else {
        handleWrong();
      }
    }
  }, [
    isPlaying, userInput, currentGroup, consecutiveCorrect, advanceThreshold,
    currentLevel, notification, updateLevelAndSpeed, currentPreset, progressiveSpeedMode,
    wpm, showNotification, startNewGroup, updatePerformanceData, transitionDelay
  ]);

  const handleKeyPress = useCallback((e) => {
    if (!isPlaying || notification) return;

    const key = e.key.toUpperCase();
    if (currentPreset.type === 'character') {
      const availableChars = morseRef.current.getAvailableChars(currentLevel);
      if (availableChars.includes(key)) {
        handleCharacterInput(key);
      }
    } else {
      handleCharacterInput(key);
    }
  }, [isPlaying, handleCharacterInput, notification, currentLevel, currentPreset]);

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

  const handleFarnsworthChange = (delta) => {
    const newSpacing = Math.max(0, Math.min(15, farnsworthSpacing + delta));
    setFarnsworthSpacing(newSpacing);
    if (isPlaying) {
      morseAudio.stop();
      startNewGroup(currentLevel, transitionDelay);
    }
  };

  const handleGroupSizeChange = (delta) => {
    const newSize = Math.max(1, Math.min(10, groupSize + delta));
    setGroupSize(newSize);
    if (isPlaying) {
      morseAudio.stop();
      startNewGroup(currentLevel, transitionDelay);
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
      startNewGroup(currentLevel, transitionDelay);
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
      startNewGroup(currentLevel, transitionDelay);
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

  const handlePresetChange = (presetId) => {
    morseRef.current.setPreset(presetId);
    setCurrentPreset(morseRef.current.getCurrentPreset());
    setCurrentLevel(1);
    setConsecutiveCorrect(0);
    showNotification(`Switched to ${morseRef.current.getCurrentPreset().name}`, 'blue', transitionDelay);
    if (isPlaying) {
      morseAudio.stop();
      startNewGroup(1, transitionDelay);
    }
  };

  const handleAdvanceThresholdChange = (delta) => {
    const newThreshold = Math.max(1, Math.min(10, advanceThreshold + delta));
    setAdvanceThreshold(newThreshold);
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
        morseAudio.stop();
        setIsPaused(true);
        showNotification('Audio paused - tab inactive', 'yellow', transitionDelay);
      } else if (!document.hidden && isPaused && isPlaying) {
        setIsPaused(false);
        startNewGroup(currentLevel, transitionDelay);
        showNotification('Audio resumed', 'blue', transitionDelay);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying, isPaused, currentLevel, showNotification, startNewGroup, transitionDelay]);

  return (
    <>
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
        qsbAmount={qsbAmount}
        onQsbChange={handleQsbChange}
        qrmAmount={qrmAmount}
        onQrmChange={handleQrmChange}
        presets={morseRef.current.getPresets()}
        currentPreset={currentPreset}
        onPresetChange={handlePresetChange}
        advanceThreshold={advanceThreshold}
        onAdvanceThresholdChange={handleAdvanceThresholdChange}
        farnsworthSpacing={farnsworthSpacing}
        onFarnsworthChange={handleFarnsworthChange}
        progressiveSpeedMode={progressiveSpeedMode}
        onProgressiveSpeedToggle={handleProgressiveSpeedToggle}
        onCustomizeClick={() => setIsModalOpen(true)}
        customSequence={customSequence}
        levelSpacing={levelSpacing}
        onLevelSpacingChange={handleLevelSpacingChange}
        transitionDelay={transitionDelay}
        onTransitionDelayChange={handleTransitionDelayChange}
      />

      <CustomAlphabetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedChars={customSequence.split('')}
        onSave={saveCustomSequence}
      />
    </>
  );
};

export default MorseTrainer;