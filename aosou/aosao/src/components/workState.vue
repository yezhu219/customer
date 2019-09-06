<template>
  <div class="workState">
     <div class=" fz14 mb-10 pr">
      <p class="shadow-2 cp" @click.stop="workState">工作状态</p>

      <div class="work-setting text-c fz12" v-show="showWorkSetting" >
        <div class="btn btn-work c-2a" @click.stop="updateWorkInfo({work_state:!workInfo.work_state})">{{workInfo.work_state?'下班':'上班'}}</div>
        <div>↑点击“{{workInfo.work_state?'下班':'上班'}}”<br>暂停所有刷新</div>
        <div class="or">or</div>
        <div class="btn c-2a"  @click.stop="settingAutoWork('111')" >{{workInfo.work_state ?' 自动下班':'自动上班'}}</div>
      </div>
      <!-- 设置自动下班 -->
      <div class="auto-setting lh-2 text-c fz12" v-if="showOffWork">
        <div class="mb-10">自动下班</div>
        <div class="time-pick mb-10">
          <el-time-picker
          v-model="offTime"
          :picker-options="{
            selectableRange: '00:00:00 - 23:59:59'
          }"
          placeholder="请选择时间">
        </el-time-picker>
        </div>
        <div>设置每日下班时间，<br>到时自动暂停刷新哦~</div>
        <div class="ok c-2a" @click="updateWorkInfo({closing_time:offTime})">ok</div>
      </div>
      <!-- 设置上班 -->
      <div class="auto-setting lh-2 text-c fz12" v-if="showWork">
        <div class="mb-10">自动上班</div>
        <div class="time-pick mb-10">
          <el-time-picker
            v-model="workTime"
            :picker-options="{
              selectableRange: '00:00:00 - 23:59:59'
            }"
            placeholder="请选择时间">
          </el-time-picker>
        </div>
        <div>设置每日上班时间，<br>到时自动暂停刷新哦~</div>
        <div class="ok c-2a" @click.stop="updateWorkInfo({working_time:workTime})">ok</div>
      </div>
    </div>
    <div v-if="workInfo.work_state">
      <p class="fz14 c-38 " >上班中</p>
      <p class="fz12 c-38">{{workInfo.working_time}}&nbsp;自动上班</p>
    </div>
    <div v-else>
      <p class="fz14 c-38 ">下班</p>
      <p class="fz12 c-38">{{workInfo.losing_time}}&nbsp;自动下班</p>
    </div>
  </div>
</template>

<script>
import { dateFormat } from '@/utils.js'
export default {
  props: {
    workInfo: {
      type:Object,
      default:{}
    }
  },
  data() {
    return {
       showWorkSetting:false,
      showTips:false,
      showOffWork:false,
      showWork:false,
      offTime:'',
      workTime:''
    }
  },
  mounted() {
    document.addEventListener('click',(e)=>{
      let dom = document.querySelector('.work-setting')
      if(dom&&!dom.contains(e.target)) {
        this.showWorkSetting = false
      }
      let pop = document.querySelector('.auto-setting')
      if(pop&&!pop.contains(e.target)) {
        this.showWork = this.showOffWork = false
      }
    })
  },
  methods: {
    workState() {
      if(this.showOffWork || this.showWork) return 
      this.showWorkSetting = !this.showWorkSetting
    }, 
    settingAutoWork() {
      if(this.workInfo.work_state) {
        this.showOffWork = true
      }else {
        this.showWork = true
      }
      this.showWorkSetting = false
    },
    async updateWorkInfo(data) {
      if(data.closing_time ) {
        data.closing_time = dateFormat('HH:MM:SS',data.closing_time)
        this.showOffWork = false
      }
      if(data.working_time) {
        data.working_time = dateFormat('HH:MM:SS',data.working_time)
        this.showWork = false
      }
      let res = await this.$api.updateWorkInfo(data)
      if(res&&res.msg) {
        this.$message({
          message:'更新工作状态成功！',
          type:'success'
        })
      }else {
        this.$message({
          message:'更新工作状态失败！',
          type:'error'
        })
      }
      this.showWorkSetting = this.showWork = this.showOffWork = false
      this.$emit('updatState')
    }

  },
}
</script>


<style lang="less">
  .workState {
    .work-setting {
    position: absolute;
    left: 50%;
    top: 21px;
    z-index: 100;
    transform: translateX(-50%);
    width: 120px;
    padding: 20px;
    border-radius: 12px;
    background-color: rgba(0,0,0,.7);
    .btn {
      width: 59px;
      height: 23px;
      text-align: center;
      line-height: 23px;
      background-color: #fff;
      border-radius: 6px;
      margin: 0 auto;
      &.btn-work {
        margin-bottom: 15px;
      }
    }
    
    .or {
      margin-top: 8px;
      margin-bottom: 15px;
    }
  }
  .auto-setting {
    width: 100%;
    position: absolute;
    left: 50%;
    top: 21px;
    z-index: 100;
    padding: 10px 0;
    transform: translateX(-50%);
    border-radius: 12px;
    background-color: rgba(0,0,0,.7);
    .ok {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      line-height: 22px;
      margin: 0 auto;
      background-color: #fff;
    }
  }
   .time-pick {
    padding: 0 10px;
    input {
      &::placeholder {
        color: #2a82e4;
      }
    }
    .el-icon-time {
      color: #2a82e4;
    }
  }
}
</style>