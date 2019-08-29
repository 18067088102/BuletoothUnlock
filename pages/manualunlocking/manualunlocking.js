// pages/manualunlocking.js
let queryBean
var that = this;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        blueToothName: '508CB164ABEE',
        command: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var that = this;
        // queryBean = options.blueToothName;
        this.setData({
            blueToothName: options.blueToothName
        })
        wx.openBluetoothAdapter({
            success: function(res) {
                wx.showToast({
                    title: '打开蓝牙成功',
                    icon: 'success',
                    duration: 2000
                });
                that.scanNumber();
            },

            fail: function(res) {
                wx.showToast({
                    title: '打开蓝牙失败，请打开蓝牙',
                    icon: 'none',
                    duration: 4000
                });
            }
        })

        that.scanNumber();
    },

    scanNumber: function(e) {
        var that = this;
        wx.showLoading({
            title: '连接中...',
            icon: 'none',
            duration: 4000
        });
        wx.startBluetoothDevicesDiscovery({
            services: [],
            allowDuplicatesKey: false,
            success: function(res) {
                console.log('这里是开始搜索附近设备', res);
                wx.onBluetoothDeviceFound(function(res) {
                    console.log("成功", res.devices[0].deviceId);
                    console.log("搜索蓝牙名称", res.devices[0].name);
                    // console.log("匹配蓝牙名称", 'BLE SPS');
                    //that.data.blueToothName
                    if (res.devices[0].name == that.data.blueToothName) {
                        wx.stopBluetoothDevicesDiscovery({
                            success: function(res) {
                                console.log('停止搜索设备', res)
                            }
                        });
                        that.setData({
                            deviceId: res.devices[0].deviceId,
                            deviceName: res.devices[0].name
                        });

                        /* 开始连接蓝牙设备 */
                        wx.createBLEConnection({
                            deviceId: that.data.deviceId,
                            success: function(res) {
                                console.log('连接成功', res);
                                wx.hideLoading();
                                /* 获取设备的服务UUID */
                                wx.getBLEDeviceServices({
                                    deviceId: that.data.deviceId,
                                    success: function(service) {
                                        var all_UUID = service.services; //取出所有的服务
                                        console.log('所有的服务', all_UUID);
                                        var UUID_lenght = all_UUID.length; //获取到服务数组的长度
                                        /* 遍历服务数组 */
                                        for (var index = 0; index < UUID_lenght; index++) {
                                            var ergodic_UUID = all_UUID[index].uuid; //取出服务里面的UUID
                                            var UUID_slice = ergodic_UUID.slice(4, 8); //截取4到8位
                                            /* 判断是否是我们需要的FEE0 */
                                            if (UUID_slice == 'FEE0' || UUID_slice == 'fee0') {
                                                var index_uuid = index;
                                                that.setData({
                                                    serviceId: all_UUID[index_uuid].uuid //确定需要的服务UUID
                                                });
                                            };
                                        };
                                        console.log('需要的服务UUID', that.data.serviceId)
                                        that.Characteristics(); //调用获取特征值函数
                                    },
                                });

                            },
                        })
                        /* 连接蓝牙设备  end*/
                    }
                });
            },
        });

    },

    Characteristics: function() {
        var that = this;
        var device_characteristics = [];
        var characteristics_uuid = {};
        wx.getBLEDeviceCharacteristics({
            deviceId: that.data.deviceId,
            serviceId: that.data.serviceId,
            success: function(res) {
                var characteristics = res.characteristics; //获取到所有特征值
                var characteristics_length = characteristics.length; //获取到特征值数组的长度
                console.log('获取到特征值', characteristics);
                console.log('获取到特征值数组长度', characteristics_length);
                /* 遍历数组获取notycharacteristicsId */
                for (var index = 0; index < characteristics_length; index++) {
                    var noty_characteristics_UUID = characteristics[index].uuid; //取出特征值里面的UUID
                    var characteristics_slice = noty_characteristics_UUID.slice(4, 8); //截取4到8位
                    /* 判断是否是我们需要的FEE1 */
                    if (characteristics_slice == 'FEE1' || characteristics_slice == 'fee1') {
                        var index_uuid = index;
                        that.setData({
                            notycharacteristicsId: characteristics[index_uuid].uuid, //需确定要的使能UUID
                            characteristicsId: characteristics[index_uuid].uuid //暂时确定的写入UUID
                        });
                        /* 遍历获取characteristicsId */
                        for (var index = 0; index < characteristics_length; index++) {
                            var characteristics_UUID = characteristics[index].uuid; //取出特征值里面的UUID
                            var characteristics_slice = characteristics_UUID.slice(4, 8); //截取4到8位
                            /* 判断是否是我们需要的FEE2 */
                            if (characteristics_slice == 'FEE2' || characteristics_slice == 'fee2') {
                                var index_uuid = index;
                                that.setData({
                                    characteristicsId: characteristics[index_uuid].uuid //确定的写入UUID
                                });
                            };
                        };
                    };
                };
                console.log('使能characteristicsId', that.data.notycharacteristicsId);
                console.log('写入characteristicsId', that.data.characteristicsId);
                that.notycharacteristicsId(); //使能事件

            },
        })
    },


    /* 使能函数 */
    notycharacteristicsId: function() {
        var that = this;
        var recv_value_ascii = "";
        var string_value = "";
        var recve_value = "";
        wx.notifyBLECharacteristicValueChange({
            deviceId: that.data.deviceId,
            serviceId: that.data.serviceId,
            characteristicId: that.data.notycharacteristicsId,
            state: true,
            success: function(res) {
                console.log('使能成功', res);
                /* 设备返回值 */
                wx.onBLECharacteristicValueChange(function(res) {
                    var length_hex = [];
                    var turn_back = "";
                    var result = res.value;
                    var hex = that.buf2hex(result); //转16进制

                    console.log('返回的值', hex);
                    //  if(hex == '0201'){
                    //    wx.showToast({
                    //      title: '开门成功',
                    //      icon: 'success',
                    //    })
                    //  }else{
                    //    wx.showToast({
                    //      title: '开门失败，请重试',
                    //      icon: 'none',
                    //    })
                    //  }


                });
                //  此处请求接口判断是否有权限
                that.SendTap();
            },

            fail: function(res) {
                console.log('使能失败', res);
            }
        })
    },

    /* 发送的值 */
    SendTap: function() {
        var that = this;
        var write_array = [];
        var charCodeAt = [];
        var value_ascii = "";
        var recv_value_ascii = "";
        var string_value = "";
        var recve_value = "";
        var value_initial_1 = 'zmkm'; //拿到输入框的值
        console.log('输入框中的值', value_initial_1);

        /* 判断字节是否超过20字节 */
        if (value_initial_1.length > 20) { //当字节超过20的时候，采用分段发送
            if (that.data.send_string == true) { //选择16进制发送时
                var value_initial_exceed = value_initial_1; //将输入框的值取过来，方便循环
                var value_initial_average = Math.ceil(value_initial_exceed.length / 20); //将value_initial_exceed的长度除以20，余数再向上取一，确定循环几次
                console.log('需要循环的次数', value_initial_average);
                for (var i = 0; i < value_initial_average; i++) {
                    if (value_initial_exceed.length > 20) {
                        var value_initial_send = value_initial_exceed.slice(0, 20); //截取前20个字节
                        console.log('截取到的值', value_initial_send);
                        value_initial_exceed = value_initial_exceed.substring(20); //value_initial_exceed替换为取掉前20字节后的数据
                        write_array.push(value_initial_send); //将所有截取的值放在一个数组
                    } else {
                        write_array.push(value_initial_exceed);
                    }
                }
                console.log('write_array数组', write_array);
                write_array.map(function(val, index) {
                    setTimeout(function() {
                        var value_set = val;
                        console.log('value_set', value_set);
                        var write_function = that.write(value_set); //调用数据发送函数
                    }, index * 100)
                });
                /* 发送的值的字节 */
                var send_number_1 = that.data.send_number + value_initial_1.length / 2;
                var send_number = Math.floor(send_number_1);
                that.setData({
                    send_number: send_number
                });
            } else { //选择Ascii码发送

                /* 当选择以Ascii字符发送的时候 */
                var value_split = value_initial_1.split(''); //将字符一个一个分开
                console.log('value_split', value_split);
                for (var i = 0; i < value_split.length; i++) {
                    value_ascii = value_ascii + value_split[i].charCodeAt().toString(16); //转为Ascii字符后连接起
                }
                var Ascii_value = value_ascii;
                console.log('转为Ascii码值', Ascii_value);
                console.log('Ascii_value的长度', Ascii_value.length)
                var Ascii_send_time = Math.ceil(Ascii_value.length / 20);
                console.log('Ascii发送的次数', Ascii_send_time);
                for (var i = 0; i < Ascii_send_time; i++) {
                    if (Ascii_value.length > 20) {
                        var value = Ascii_value.slice(0, 20);
                        console.log('截取到的值', value);
                        Ascii_value = Ascii_value.substring(20);
                        console.log('此时剩下的Ascii_value', Ascii_value);
                        write_array.push(value); //放在数组里面
                    } else {
                        var value = Ascii_value;
                        write_array.push(Ascii_value); //放在数组里面
                    }
                }
                console.log('数组write_array', write_array);
                write_array.map(function(val, index) {
                    setTimeout(function() {
                        var value_set = val;
                        console.log('value_set', value_set);
                        var write_function = that.write(value_set); //调用数据发送函数
                    }, index * 100)
                });
                /* 发送的值的字节 */
                var send_number_1 = that.data.send_number + value_initial_1.length;
                var send_number = Math.round(send_number_1);
                that.setData({
                    send_number: send_number
                });
            }
        } else { //当字节不超过20的时候，直接发送
            /* 判断选择了Hex还是Ascii发送 */
            if (that.data.send_string == true) {
                /* 当选择了以Hex十六进制发送的时候 */
                var value = value_initial_1;
            } else {
                /* 当选择以Ascii字符发送的时候 */
                var value_split = value_initial_1.split(''); //将字符一个一个分开
                console.log('value_split', value_split);
                for (var i = 0; i < value_split.length; i++) {
                    value_ascii = value_ascii + value_split[i].charCodeAt().toString(16); //转为Ascii字符后连接起
                }
                var value = value_ascii;
                console.log('转为Ascii码值', value);
            }
            var write_function = that.write(value); //调用数据发送函数
            /* 成功发送的值的字节 */
            if (that.data.send_string == true) {
                var send_number_1 = that.data.send_number + value_initial_1.length / 2;
                var send_number = Math.floor(send_number_1);
                that.setData({
                    send_number: send_number
                });
            } else {
                var send_number_1 = that.data.send_number + value_initial_1.length;
                var send_number = Math.round(send_number_1);
                that.setData({
                    send_number: send_number
                })
            }
        }
    },
    write: function(str) {
        var that = this;
        var value = str;
        console.log('value', value);
        /* 将数值转为ArrayBuffer类型数据 */
        var typedArray = new Uint8Array(value.match(/[\da-f]{2}/gi).map(function(h) {
            return parseInt(h, 16)
        }));
        var buffer = typedArray.buffer;
        wx.writeBLECharacteristicValue({
            deviceId: that.data.deviceId,
            serviceId: that.data.serviceId,
            characteristicId: that.data.characteristicsId,
            value: buffer,
            success: function(res) {
                console.log('数据发送成功', res);
                wx.closeBluetoothAdapter({ //关闭蓝牙模块
                    success(res) {
                        console.log('关闭蓝牙模块', res);
                    }
                })
                wx.showToast({
                    title: '开门成功',
                    icon: 'success',
                })

                wx.redirectTo({
                    url: '../index/index'
                })
            },
            fail: function(res) {
                console.log('调用失败', res);
                /* 调用失败时，再次调用 */
                wx.writeBLECharacteristicValue({
                    deviceId: that.data.deviceId,
                    serviceId: that.data.serviceId,
                    characteristicId: that.data.characteristicsId,
                    value: buffer,
                    success: function(res) {
                        console.log('第2次数据发送成功', res);
                        wx.closeBluetoothAdapter({ //关闭蓝牙模块
                            success(res) {
                                console.log('关闭蓝牙模块', res);
                            }
                        })
                        wx.redirectTo({
                            url: '../index/index'
                        })
                    },
                    fail: function(res) {
                        console.log('第2次调用失败', res);
                        /* 调用失败时，再次调用 */
                        wx.writeBLECharacteristicValue({
                            deviceId: that.data.deviceId,
                            serviceId: that.data.serviceId,
                            characteristicId: that.data.characteristicsId,
                            value: buffer,
                            success: function(res) {
                                console.log('第3次数据发送成功', res);
                                wx.closeBluetoothAdapter({ //关闭蓝牙模块
                                    success(res) {
                                        console.log('关闭蓝牙模块', res);
                                    }
                                })
                                wx.redirectTo({
                                    url: '../index/index'
                                })
                            },
                            fail: function(res) {
                                console.log('第3次调用失败', res);
                                wx.showLoading({
                                    title: '开门失败，关闭页面再次尝试...',
                                    icon: 'none',
                                    duration: 4000
                                });
                            }
                        });
                    }
                });
            }
        });
    },
    /* ArrayBuffer类型数据转为16进制字符串 */
    buf2hex: function(buffer) { // buffer is an ArrayBuffer
        return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
    },

    //获取用户输入的密码
    command: function(e) {
        var that = this;
        console.log('0', e.detail.value)
        this.setData({
            command: e.detail.value
        })
    },

    unlock: function() {
        var that = this;
        if (this.data.command != '') {
            wx.showLoading({
                title: '开门中...',
                icon: 'none',
                duration: 3000
            });
            that.scanNumber();

        } else {
            wx.showToast({
                title: '请输入命令',
                icon: 'none',
                duration: 3000
            });
        }
    }
})