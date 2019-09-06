<template>
 <div class="user fz12 pr">
  <div class="mb-10" @click.stop="clickUserInfo">
    <el-avatar :size="30" :src="userInfo.headimgurl" class="va-m userImg"></el-avatar>
    <svg-icon icon-class="arrow-down" class="va-m"></svg-icon>
  </div>
  <p class="c-38">剩余查询{{userInfo.remaining_number}}次</p>
  <!-- 展开头像 -->
  <div class="userInfo  fz14 pa" ref="userInfo" v-show="showUserInfo" >
    <p class="userName fw-600">{{userInfo.nickname}}</p>
    <p class="fz12 tel">手机号：{{userInfo.tel}}</p>
    <p class="fz12">剩余查询次数：{{userInfo.remaining_number}} 次</p>
    <p class="btn" @click.stop="query"><svg-icon icon-class="query" class="icon"></svg-icon>查询/充值记录</p>
    <p class="btn" @click.stop="pay"><svg-icon icon-class="shopCar" class="icon"></svg-icon>充值</p>
    <p class="btn" @click.stop="signOut"><svg-icon icon-class="signout" class="icon"></svg-icon>退出登录</p>
  </div>

  <!-- 查询记录 -->
  <el-dialog :visible.sync="showQuery" :modal="false">
    <el-row :gutter="20" class="mb-20">
      <el-col :span="12"><div class="text-r tab-item " :class="[!isClick?'active':'']" @click="queryHistory">查询记录</div></el-col>
      <el-col :span="12"><div class="text-l tab-item " :class="[isClick?'active':'']" @click="payHistory">充值记录</div></el-col>
    </el-row>
    <el-row v-if="!isClick">
      <el-col class="fz12 c-64" v-for="(item, index) in queryData" :key="index">
        <span class="c-2a fz14 mr-10">{{item.sort}}</span>
        <span class="mr-10">查询时间:{{item.createtime | resetTime}} </span>
        <span class="mr-10"> 渠道:{{item.channel}} </span>
        <span class="mr-10">入住日期:{{item.check_in_date |formateDate}}</span>
        <span class="mr-10">离店日期:{{item.check_out_date|formateDate}}</span>
        <span class="mr-10">酒店: {{item.hotel_name}}</span>
        <span class="mr-10">房型:{{item.room_type}} </span>
        <span class="mr-10">床型:{{item.bed_type}}</span>
        <span class="mr-10"> 早餐:{{item.breakfast_type}}</span>
        <span class="mr-10">取消:{{item.cancel_type}}</span>
        <span class="mr-10">含税价:{{item.after_tax_price}}</span>
      </el-col>
    </el-row>
    <el-row v-if="isClick">
      <el-col v-for="(item, index) in payData" :key="index">
        <span class="mr-20">日期：{{item.pay_time| resetDate}}</span>
        <span class="mr-20">时间：{{item.pay_time| resetTime}}</span>
        <span class="mr-20">追加：{{item.number}}次查询</span>
        <span class="mr-20">金额：￥{{item.money}}</span>
        <span class="mr-20">支付方式：微信</span>
      </el-col>
    </el-row>
  </el-dialog>
  <!-- 充值 -->
  <div class="addQuery fz14 c-fff" v-show="showAddQuery">
    <el-row>
      <el-col class="text-c mb-20">
        <svg-icon icon-class="shopCar" class="mr-10"></svg-icon>追加查询次数
      </el-col>
      <el-col class="mb-20">
        <span class="mr-20">追加账号</span>
        <span> {{userInfo.nickname}}-{{userInfo.tel}}</span>
      </el-col>
      <el-col class="mb-20">
        <span class="mr-20">追加次数</span>
        <el-input-number v-model="num" controls-position="right" @change="handleChange" :min="1" ></el-input-number>次
      </el-col>
      <el-col class="mb-20">
        <span class="mr-20">应付金额</span>
        
        <span class="c-ff">¥{{calcMoney}}</span>
      </el-col>
      <el-col class="mb-20">
        <span class="mr-20">支付方式</span>
        <svg-icon icon-class="wx"></svg-icon>
        <span>微信支付 </span>
      </el-col>
      <el-col class="mb-20 text-c">
        <div class="ok c-2a fz12" @click="toPay">ok</div>
      </el-col>
    </el-row>
  </div>

  <!-- 支付 -->
  <div class="toPay" v-show="showToPay">
    <el-row class="fz14 c-fff text-c">
      <el-col class="fw-600 mb-10">微信支付：￥{{calcMoney}}</el-col>
      <el-col>请用微信扫一扫哦~</el-col>
      <el-col><img :src="qr" alt=""></el-col>
      <el-col>支付后记得刷新页面~</el-col>
    </el-row>
  </div>
</div>

  
</template>

<script>
import { dateFormat } from '@/utils'
export default {
  props:{
    userInfo:{
      type:Object,
      
    }
  },
  data() {
    return {
      showUserInfo:false,
      showQuery:false,
      isClick:false,
      queryData:[],
      payData:[],
      showAddQuery:false,
      showToPay:false,
      num:'',
      pageSize:20,
      pageNumber:1,
      qr:'',
    }
  },
  computed: {
    calcMoney() {
      return Number(this.num)*Number(this.userInfo.unit_price)
    }
  },
  mounted() {
    document.addEventListener('click',(e)=>{
      let dom = document.querySelector('.userInfo')
      if(dom&&!dom.contains(e.target)) {
        this.showUserInfo = false
      }
      let pop = document.querySelector('.addQuery')
      if(pop&&!pop.contains(e.target)) {
        this.showAddQuery = this.showUserInfo = false
      }
      let pop2 = document.querySelector('.toPay')
      if(pop2&&!pop.contains(e.target)) {
        this.showAddQuery = this.showUserInfo = this.showToPay = false
      }
    })
  },
  methods: {
    clickUserInfo() {
      this.showUserInfo = !this.showUserInfo
    },
    async query() {
      this.showQuery = true
      let data = await this.$api.getQueryLog({pageSize:this.pageSize,pageNumber:this.pageNumber})
      this.queryData = data.list
    },
    async pay() {
      this.showAddQuery = true
      this.showUserInfo = false
    },
    signOut() {

    },
    async queryHistory() {
      this.isClick = !this.isClick
      let data = await this.$api.getQueryLog({pageSize:this.pageSize,pageNumber:this.pageNumber})
      this.queryData = data.list
    },
    async payHistory(){
      this.isClick = !this.isClick
     let data = await this.$api.getRechargeLog({pageSize:this.pageSize,pageNumber:this.pageNumber})
     this.payData = data.list
    },
    handleChange() {

    },
    async toPay() {
      this.showAddQuery = false
      let res = await this.$api.getPayCode({number:this.num,money:this.calcMoney})
      if(res.data) {
        this.qr = res.data
        this.showToPay = true

      }
    }
  },
  filters: {
    resetTime(val) {
      if(!val) return 'null'
      return dateFormat('HH:mm',val)
    },
    resetDate(val) {
      if(!val) return 'null'
      return dateFormat('YYYY年mm月dd日',val)
    },
    formateDate(val) {
      if(!val) return 'null'
      let res = dateFormat('mm月dd日',val)
      return res
    },
  }
}
</script>



<style lang="less">
   .user {
    .userImg {
      margin-right: 8px;
    }
    .userInfo {
      right: 28px;
      top: 31px;
      background-color: rgba(0,0,0,.7);
      width: 220px;
      height: 290px;
      border-radius: 8px;
      padding-top:25px;
      z-index: 100;
      p {
        margin-bottom: 20px;
        &.tel {
          margin-bottom: 12px;
        }
      }
      .btn {
        width: 151px;
        height: 32px;
        line-height: 32px;
        border:1px  solid rgba(255, 255, 255, 1) ;
        border-radius: 9px;
        margin: 0 auto 20px auto;
        position: relative;
        .icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
        }
      }
    }
    .el-dialog {
      border-radius: 20px;
      min-width: 1300px;
      min-height: 400px;
      box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.1);
    }
  }
  .tab-item {
    color: #808080;
    font-size: 14px;
    &.active {
      color: #383838;
      font-weight: bold;
    }
  }
  .addQuery {
    position: absolute;
    z-index: 100;
    top: 31px;
    right: 15px;
    width: 327px;
    padding-left:30px;
    padding-top: 20px;
    text-align: left;
    background-color:rgba(0,0,0,.7);
    border-radius: 8px;
    .ok {
      display: inline-block;
      width: 22px;
      height: 22px;
      line-height: 22px;
      border-radius: 50%;
      background-color: #fff;
      
    }
    .el-input-number {
      width: 120px;
      margin-right: 5px;
    }
  }
  .toPay {
    position: absolute;
    z-index: 100;
    top: 31px;
    right: 15px;
    width: 230px;
    padding: 20px 0;
    background-color:rgba(0,0,0,.7);
    border-radius: 8px;
    img {
      width: 127px;
      height: 127px;
      margin: 5px auto 10px auto;
    }
  }
</style>