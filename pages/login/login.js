
//获取应用实例
const app = getApp()
var step_g = 1
var maxTime = 60
var currentTime = maxTime //倒计时的事件（单位：s）  
var interval = null

Page({

    /**
     * 页面的初始数据
     */
    data: {
        eyed: true,
        userInfo: {},
        username: '',
        password: ''
    },

    onEye() {
        this.setData({
            eyed: !this.data.eyed
        })
    },

    //获取用户输入的用户名
    usernameInput: function (e) {
        console.log('用户名', e.detail.value)
        this.setData({
            username: e.detail.value
        })
    },
    //获取用户输入的密码
    passwordInput: function (e) {
        console.log('密码', e.detail.value)
        this.setData({
            password: e.detail.value
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    formSubmit: function (e) {
        const that = this;
        const username = that.data.username
        const password = that.data.password
        console.log("username:::::::::" + username)
        console.log("password:::::::::" + password)
        if(!username||!password) {
            that._show_msg("用户名或密码不能为空")
            return
        }
        //请求登录接口
        wx.showLoading({
            title: '登录中...',
        })
        // 登录www.ysa.cncqs.cn
        wx.request({
          url: 'https://www.ysa.cncqs.cn/Intelligent-chassis/rest/user/login',
            method: 'POST',
            dataType: 'json',
            data: {
                username: that.data.username,
                password: that.data.password,
            },
            header: {
                'content-type': 'application/x-www-form-urlencoded' // 默认值
            },
            success: function (res) {
                console.log('返回数据结果', res.data) //返回数据
                if (res.data.success) {
                    wx.hideLoading()
                    app.globalData.token = res.data.info.token
                    //跳转到主页
                    wx.redirectTo({
                        url: '../index/index'
                    })
                }
                that._show_msg(res.data.msg)
            },
            fail: function (err){
                wx.hideLoading()
            }
        })
    },

    _show_msg(msg) {
        wx.showToast({
            title: msg,
            icon: 'none',
            duration: 2000
        })
    },

    goToRegister() {
        wx.navigateTo({
            url: '../register/register',
        })
    }
})