import { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { check, PERMISSIONS, request, RESULTS } from "react-native-permissions";
import AudioRecorderPlayer from "react-native-audio-recorder-player";

const PersonalityItem = ({ item, onSelect, isSelected, isAnySelected }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState(null); // Updated state
  const audioRecorderPlayer = new AudioRecorderPlayer();
  const microphonePermission =
    Platform.OS === "ios"
      ? PERMISSIONS.IOS.MICROPHONE
      : PERMISSIONS.ANDROID.RECORD_AUDIO;

  useEffect(() => {
    check(microphonePermission).then((result) => {
      if (result === RESULTS.GRANTED) {
        setHasPermission(true);
      }
    });
  }, []);

  const requestPermission = () => {
    request(microphonePermission).then((result) => {
      if (result === RESULTS.GRANTED) {
        setHasPermission(true);
      } else {
        Alert.alert(
          "Permission Denied",
          "We need microphone access for recording."
        );
      }
    });
  };

  const handleSelect = () => {
    setSelectedPersonality(item); // Update the selected personality when it's selected
    onSelect();
  };

  //const handleRecordPress = async () => {
    //if (!hasPermission) {
      //requestPermission();
     // return;
    //}

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


    // Generate a unique path for the recording
    const audioPath = Platform.select({
      ios: `hello${new Date().toISOString()}.m4a`,
      android: `sdcard/hello${new Date().toISOString()}.mp4`, // Appending timestamp for uniqueness
    });

    const result = await audioRecorderPlayer.startRecorder(audioPath);
    audioRecorderPlayer.addRecordBackListener(() => {
      return;
    });

    setIsRecording(true);
    console.log(result);
  };

  const onStopRecord = async () => {
    // Workaround: start and immediately stop recording to ensure previous recording stops
    await audioRecorderPlayer.startRecorder();
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setIsRecording(false);
    console.log(result);

    if (selectedPersonality) {
      const transcription = await transcribeAudio(audioPath); // Transcribe the recorded audio
      uploadPersonalityDocument(
        selectedPersonality._id, // Pass the selected personality's identifier
        "audio_transcription.txt",
        transcription
      );
    }
  };

  if (isAnySelected && !isSelected) {
    return null;
  }

  return (
    <View style={styles.itemContainer}>
      <View style={styles.nameContainer}>
        <Text style={styles.itemText}>{item.name}</Text>
        {!isSelected && (
          <TouchableOpacity onPress={handleSelect} style={styles.selectButton}>
            <Text style={styles.buttonText}>Select</Text>
          </TouchableOpacity>
        )}
      </View>
      {isSelected && (
        <>
          <TouchableOpacity
            style={[
              styles.speakButton,
              { backgroundColor: "#4CAF50", marginRight: 10 },
            ]}
            onPress={handleRecordPress}
          >
            <Text style={styles.buttonText}>Record</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.speakButton, { backgroundColor: "#f44336" }]}
            onPress={onStopRecord}
          >
            <Text style={styles.buttonText}>Stop Recording</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  // Rest of the styles
});

export default PersonalityItem;

///------------------------------------------------------

import axios from 'axios';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

// ...

const transcribeAudio = async (audioFilePath) => {
  const apiKey = 'YOUR_OPENAI_API_KEY';
  const audioFileUrl = Platform.OS === 'ios' ? audioFilePath : `file://${audioFilePath}`;
  const openaiUrl = 'https://api.openai.com/v1/audio/transcriptions';

  const audioData = await RNFS.readFile(audioFilePath, 'base64');

  const formData = new FormData();
  formData.append('file', audioData, 'audio.mp3');
  formData.append('model', 'whisper-1');

  try {
    const transcriptionResponse = await axios.post(openaiUrl, formData, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    const transcript = transcriptionResponse?.data?.text;
    if (!transcript) {
      throw new Error('Transcription failed.');
    }

    return transcript;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
};

const uploadPersonalityDocument = async (personalityId, filename, transcription) => {
  const apiUrl = 'YOUR_API_ENDPOINT';

  const formData = new FormData();
  formData.append('description', 'Transcription of audio');
  formData.append('is_public', 'true');
  formData.append('document_file', {
    uri: `data:text/plain;base64,${btoa(transcription)}`,
    type: 'text/plain',
    name: filename,
  });

  try {
    const response = await axios.put(
      `${apiUrl}/personalities/${personalityId}/twin/documents/${encodeURIComponent(filename)}`,
      formData
    );
    // Handle the response as needed
    // For example, you can check response.status to ensure the update was successful
  } catch (error) {
    console.error('Error updating personality document:', error);
    throw error;
  }
};

