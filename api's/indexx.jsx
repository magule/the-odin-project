import axios from 'axios';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';




//---------------------------------------------------//---------------------------------------------------



//---------------------------------------------------//---------------------------------------------------

const handleRecordPress = async () => {
  if (isRecording) {
    onStopRecord();
    const transcription = await transcribeAudio(audioPath); // Transcribe the recorded audio
    uploadPersonalityDocument(selectedPersonalityId, "audio_transcription.txt", transcription); // Upload the transcription
  } else {
    onStartRecord();
  }
};



//--------------------------------------

import { useState } from 'react';
.


  const handleRecordPress = async () => {
    if (isRecording) {
      onStopRecord();
      const transcription = await transcribeAudio(audioPath);
      if (selectedPersonality) {
        uploadPersonalityDocument(selectedPersonality._id, "audio_transcription.txt", transcription);
      }
    } else {
      onStartRecord();
    }
  };

  // ...

  return (
    // ...
  );
};


///idk


const handleRecordPress = async () => {
  if (isRecording) {
    onStopRecord();
    const transcription = await transcribeAudio(audioPath); // Transcribe the recorded audio
    uploadPersonalityDocument(selectedPersonality._id, "audio_transcription.txt", transcription); // Upload the transcription
  } else {
    onStartRecord();
  }
};


