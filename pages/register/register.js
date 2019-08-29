// pages/register/register.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        eyedFirst: true,
        eyedSecond: true,
        userInfo: {},
        username: '',
        password: '',
        surePassword: ''
    },

    onEyeFirst() {
        this.setData({
            eyedFirst: !this.data.eyedFirst
        })
    },

    onEyeSecond() {
        this.setData({
            eyedSecond: !this.data.eyedSecond
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
    //获取用户确认的密码
    passwordSureInput: function (e) {
        console.log('确认密码', e.detail.value)
        this.setData({
            surePassword: e.detail.value
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
        const surePassword = that.data.surePassword
        console.log("username:::::::::" + username)
        console.log("password:::::::::" + password)
        console.log("surePassword:::::::::" + surePassword)
        if (!username || !password || !surePassword) {
            that._show_msg("用户名或密码不能为空")
            return
        }
        if (password != surePassword) {
            that._show_msg("密码不一致,请重新输入")
        }
        //请求注册接口
        // wx.showLoading({
        //     title: '注册中...',
        // })
        // 注册
        // wx.request({
        //     url: 'https://face.ssist.cn/Intelligent-chassis/rest/user/login',
        //     method: 'POST',
        //     dataType: 'json',
        //     data: {
        //         username: that.data.username,
        //         password: that.data.password,
        //     },
        //     header: {
        //         'content-type': 'application/x-www-form-urlencoded' // 默认值
        //     },
        //     success: function (res) {
        //         console.log('返回数据结果', res.data) //返回数据
        //         if (res.data.success) {
        //             wx.hideLoading()
        //             app.globalData.token = res.data.info.token
        //             //跳转到主页
        //             wx.redirectTo({
        //                 url: '../index/index'
        //             })
        //         }
        //         that._show_msg(res.data.msg)
        //     },
        //     fail: function (err) {
        //         wx.hideLoading()
        //     }
        // })
    },

    _show_msg(msg) {
        wx.showToast({
            title: msg,
            icon: 'none',
            duration: 2000
        })
    }
})