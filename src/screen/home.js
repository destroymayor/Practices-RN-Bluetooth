import React, { Component } from "react";
import {
  Animated,
  BackHandler,
  Easing,
  Image,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  TouchableOpacity,
  View,
  Text
} from "react-native";

import BluetoohConfig from "./component/BluetoothConfig";

import { AudioRecorder, AudioUtils } from "react-native-audio";
import Icon from "react-native-vector-icons/Entypo";

export default class home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDisabled: false,
      currentTime: 0.0,
      currentMetering: 0,
      recording: false,
      recordtime: 10,
      stoppedRecording: false,
      finished: false,
      audioPath: AudioUtils.DocumentDirectoryPath + "/test.aac",
      hasPermission: undefined,
      HighestValue: [],
      scanning: false
    };
  }

  static navigationOptions = ({ navigation }) => {
    return {
      header: null
    };
  };

  componentDidMount() {
    this.AudioRecorderConfig();
  }

  _prepareRecordingPath(audioPath) {
    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 22050,
      Channels: 1,
      AudioQuality: "Low",
      AudioEncoding: "aac",
      MeteringEnabled: true
    });
  }

  AudioRecorderConfig() {
    this._checkPermission().then(hasPermission => {
      this.setState({ hasPermission });

      if (!hasPermission) {
        this.setState({ isDisabled: true });
      }

      this._prepareRecordingPath(this.state.audioPath);
      AudioRecorder.onProgress = data => {
        this.setState({
          currentTime: Math.floor(data.currentTime),
          //擷取分貝值
          currentMetering:
            Platform.OS === "ios"
              ? Math.floor(data.currentMetering).toString().slice(1, 4)
              : Math.floor(data.currentMetering / 20)
        });

        this.state.HighestValue.push(this.state.currentMetering);
        console.log(this.state.HighestValue.push(this.state.currentMetering));
      };

      AudioRecorder.onFinished = data => {
        if (Platform.OS === "ios") {
          this._finishRecording(data.status === "OK", data.audioFileURL);
        }
      };
    });
  }

  _checkPermission() {
    if (Platform.OS !== "android") {
      return Promise.resolve(true);
    }

    const rationale = {
      title: "需要麥克風權限許可",
      message: "此功能需要麥克風權限"
    };

    return PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      rationale
    ).then(result => {
      console.log("麥克風權限許可結果:", result);
      return result === true || result === PermissionsAndroid.RESULTS.GRANTED;
    });
  }

  async _StartRecord() {
    if (this.state.recording) {
      console.log("已開始錄製");
      return;
    }

    if (!this.state.hasPermission) {
      console.log("無法錄製", "沒有麥克風權限");
      return;
    }

    if (this.state.stoppedRecording) {
      this._prepareRecordingPath(this.state.audioPath);
    }

    this.setState({
      recording: true,
      isDisabled: true
    });
    try {
      const filePath = await AudioRecorder.startRecording();
    } catch (error) {}
  }

  async _StopRecord() {
    this.setState({
      stoppedRecording: true,
      recording: false
    });
    try {
      const filePath = await AudioRecorder.stopRecording();
      if (Platform.OS === "android") {
        this.setState({ finished: didSucceed });
        console.log(
          `Finished recording of duration ${this.state
            .currentTime} seconds at path: ${filePath}`
        );
      }
      return filePath;
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "space-around",
          alignItems: "center"
        }}
      >
        <BluetoohConfig />
        <View
          style={{
            alignContent: "center",
            justifyContent: "center"
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignContent: "center",
              justifyContent: "center"
            }}
          >
            <Text style={{ fontSize: 20, marginRight: 20 }}>
              {this.state.currentMetering}
            </Text>
            <Text style={{ fontSize: 20 }}>
              {this.state.currentTime}
            </Text>
          </View>
          <TouchableOpacity
            onPress={this._StartRecord.bind(this)}
            style={{
              width: 100,
              height: 40,
              backgroundColor: "#2894ff",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Text>start</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
