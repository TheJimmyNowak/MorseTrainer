# Interactive Morse Code Trainer (Koch Method)

This is an interactive web application for learning Morse code using the Koch method. The trainer provides real-time audio feedback and adaptive difficulty to help you master Morse code effectively.

Application is avaible [here](https://mashu.github.io/MorseTrainer/).

## What is the Koch Method?

The Koch method, developed by German psychologist Ludwig Koch, is considered one of the most effective ways to learn Morse code. Instead of memorizing the visual representations of Morse code characters, the Koch method focuses on:

1. Learning characters at full speed from the beginning
2. Starting with just 2 characters and gradually adding more
3. Focusing on listening and instant character recognition
4. Never slowing down the character speed, only increasing gaps between characters when needed

The sequence of characters in this trainer has been carefully chosen to optimize learning:
```
K M R S U A P T L O W I . N J E F 0 Y , V G 5 / Q 9 Z H 3 8 B ? 4 2 7 C 1 D 6 X
```

## Features

- **Adaptive Difficulty**: Starts with just a few characters and automatically advances as you improve
- **Real-time Audio**: Clear, adjustable tone for Morse code playback
- **Customizable Settings**:
  - Words Per Minute (WPM): 5-50 WPM
  - Tone frequency: 400-1000 Hz
  - Group size: 1-5 characters
  - Level advancement threshold: 1-10 correct groups
- **Progress Tracking**:
  - Success rate tracking
  - Character history
  - Current streak monitoring
  - Level progression

## How to Use

1. **Start Simple**: Begin at level 1 with just the first character 'K'
2. **Listen Carefully**: The trainer will play Morse code sequences
3. **Type What You Hear**: Enter the characters you think you heard
4. **Progress Automatically**: After several correct answers, new characters will be added
5. **Practice Regularly**: Short, regular practice sessions are more effective than long, infrequent ones

## Tips for Effective Learning

1. **Focus on Sound Patterns**: Don't think about dots and dashes; learn the rhythm and sound of each character
2. **Keep the Speed Up**: Resist the urge to slow down. It's better to make mistakes at full speed than to learn slowly
3. **Practice Daily**: Even 10-15 minutes per day is more effective than longer, irregular sessions
4. **Don't Look at the Screen**: Try to focus entirely on the sounds and type what you hear
5. **Take Breaks**: If you find your accuracy dropping, take a short break and return fresh

## Settings Guide

- **WPM (Words Per Minute)**: Affects the speed of individual characters. Start at 15-20 WPM
- **Group Size**: Number of characters played in sequence. Start small and increase as you improve
- **Tone**: Choose a comfortable frequency that you can listen to for extended periods
- **Advance Threshold**: How many correct answers needed to advance to the next level

## Installation

Visit the live version at: [https://mashu.github.io/MorseTrainer](https://mashu.github.io/MorseTrainer)

Or run locally:
```bash
git clone https://github.com/mashu/MorseTrainer.git
cd morse-trainer
npm install
npm run dev
```

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Ludwig Koch for developing the original method
- The amateur radio community for preserving and promoting Morse code
- All contributors and users who help improve this trainer
