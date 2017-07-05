import React, { Component } from "react";
import {
  Platform,
  FlatList,
  NativeAppEventEmitter,
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  TouchableOpacity,
  Text,
  View
} from "react-native";

import BleManager from "react-native-ble-manager";

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export default class Bluetoothconfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scanning: false,
      peripherals: new Map()
    };

    this.startScan = this.startScan.bind(this);

    ///
    this.handleStopScan = this.handleStopScan.bind(this);
    this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
    this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(
      this
    );
    this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(
      this
    );
  }

  componentDidMount() {
    BleManager.start({ showAlert: false, allowDuplicates: false }).then(() => {
      console.log("模塊初始化");
    });

    this.handlerDiscover = bleManagerEmitter.addListener(
      "BleManagerDiscoverPeripheral",
      this.handleDiscoverPeripheral
    );
    this.handlerStop = bleManagerEmitter.addListener(
      "BleManagerStopScan",
      this.handleStopScan
    );
    this.handlerDisconnect = bleManagerEmitter.addListener(
      "BleManagerDisconnectPeripheral",
      this.handleDisconnectedPeripheral
    );
    this.handlerUpdate = bleManagerEmitter.addListener(
      "BleManagerDidUpdateValueForCharacteristic",
      this.handleUpdateValueForCharacteristic
    );
  }

  componentWillUnmount() {
    this.handlerDiscover.remove();
    this.handlerStop.remove();
    this.handlerDisconnect.remove();
    //this.handlerUpdate.update();
  }

  startScan() {
    BleManager.enableBluetooth()
      .then(() => {
        console.log("已啟用藍牙或用戶確認");
        if (!this.state.scanning) {
          BleManager.scan([], 60, true).then(results => {
            console.log("掃描中...");
            this.setState({ scanning: true });
          });
        }
      })
      .catch(error => {
        console.log("用戶拒絕啟用藍牙");
      });
  }

  handleStopScan() {
    BleManager.stopScan().then(() => {
      this.setState({ scanning: false });
      console.log("停止掃描");
    });
  }

  handleDisconnectedPeripheral(data) {
    let peripherals = this.state.peripherals;
    let peripheral = peripherals.get(data.peripheral);
    if (peripheral) {
      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
      this.setState({ peripherals });
    }
    console.log("斷開連接" + data.peripheral);
  }

  handleUpdateValueForCharacteristic(data) {
    console.log(
      "接收到的數據 " + data.peripheral + " characteristic " + data.characteristic,
      data.value
    );
  }

  handleDiscoverPeripheral(peripheral) {
    const peripherals = this.state.peripherals;
    if (!peripherals.has(peripheral.id)) {
      console.log("偵測到設備 - mac位址: ", peripheral.id, "名稱: ", peripheral.name);
      peripherals.set(peripheral.id, peripheral);
      this.setState({ peripherals });
    }
  }

  test(peripheral) {
    if (peripheral) {
      if (peripheral.connected) {
        BleManager.disconnect(peripheral.id);
      } else {
        BleManager.connect(peripheral.id)
          .then(() => {
            let peripherals = this.state.peripherals;
            let p = peripherals.get(peripheral.id);
            if (p) {
              p.connected = true;
              peripherals.set(peripheral.id, p);
              this.setState({ peripherals });
            }
            console.log("連接到  " + peripheral.id);
          })
          .catch(error => {
            console.log("連接錯誤 ", error);
          });
      }
    }
  }

  _renderBtn = (text, onPress) =>
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: 150,
        height: 40,
        margin: 3,
        backgroundColor: "#2894ff",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Text>
        {text}
      </Text>
    </TouchableOpacity>;

  render() {
    return (
      <View style={{ flex: 1, margin: 5 }}>
        <FlatList
          data={Array.from(this.state.peripherals.values())}
          style={{ flex: 1, backgroundColor: "#e0e0e0", width: 300 }}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const color = item.connected ? "green" : "#fff";
            return (
              <TouchableOpacity onPress={() => this.test(item)}>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    margin: 10,
                    backgroundColor: color
                  }}
                >
                  <Text>
                    {item.name}
                  </Text>
                  <Text>
                    {item.id}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          {!this.state.scanning
            ? this._renderBtn("掃描裝置", () => {
                this.startScan();
              })
            : this._renderBtn("停止掃描", () => {
                this.handleStopScan();
              })}
        </View>
      </View>
    );
  }
}
