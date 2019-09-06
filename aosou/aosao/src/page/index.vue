<template>
 <div class="index">
  <el-row class="c-fff fz18 header lh-2">
    <el-col :span="12">
      <div class="logo   shadow-1"><p>aosao</p><span>空房助手</span></div>
    </el-col>
    <el-col :span="12">
     <el-row class="text-c">
      <el-col :span="8">
        <workState :workInfo = "workInfo" @updatState="changeState"></workState>
      </el-col>
      <el-col :span="8">
        <div class="pr">
          <p class="shadow-2 fz14 cp" @click.stop="showTips=!showTips">使用说明</p>
          <div class="tips fz14 text-c c-fff" v-show="showTips">
            <div class="tip-item">TIPS</div>
            <div class="tip-item">1.双击查询组进行修改</div>
            <div class="tip-item">2.按住<svg-icon icon-class="drag"></svg-icon>      拖动查询组</div>
            <div class="tip-item">3.点击<svg-icon icon-class="add"></svg-icon>      添加查询组</div>
            <div class="tip-item">4.点击 <svg-icon icon-class="del"></svg-icon>     删除查询组</div>
            <div class="tip-item">5.点击<svg-icon icon-class="refresh"></svg-icon>      刷新查询组</div>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
       <user :userInfo = "userInfo"></user>
      </el-col>
     </el-row>
    </el-col>
  </el-row>
  <div class="main pr">
    <div class="pa pagination">
      <el-pagination
        background
        layout="prev, pager, next"
        :page-size="20"
        hide-on-single-page
        @current-change="pageChange"
        :total="total">
      </el-pagination>
    </div>
    <div class="menu fz12 c-2a pr">
      <span class="cp left" :class="[showLeftIcon?'b-fz':'']" @click="selMany">多选</span>
      <svg-icon icon-class="add" class="icon-add middle cp" :class="[isAdd?'b-fz':'']" @click="add"></svg-icon>
      <span class="cp right" :class="[showRightIcon?'b-fz':'']" @click="copy">复制</span>
    </div>
    <el-table :data="tableData" class="table" border ref="dragTable" @cell-dblclick="cellClick" > 
      <el-table-column width="60" align="center">
        <template slot="header" slot-scope="scope">
          <div>
            <svg-icon icon-class="save" v-if="(showLeftIcon||showRightIcon)&& !isAll" @click="selAll"></svg-icon>
            <svg-icon icon-class="checkAll" v-if="(showLeftIcon||showRightIcon)&&isAll" @click="clearAll"></svg-icon>
          </div>
        </template>
        <template slot-scope="scope">
          <svg-icon icon-class="drag" class="dragBtn" :data-id="scope.row.id.value" v-if="defaultState &&!(isEdit &&(scope.row.id.value==currentIndex))"></svg-icon>
          <svg-icon icon-class="close"  v-if="isEdit &&(scope.row.id.value==currentIndex)" @click="closeEdit"></svg-icon>
          <svg-icon icon-class="save-cirle-gray" v-if="(showLeftIcon ||showRightIcon)&& !scope.row.isSelected" @click="selectClick(scope.row,true)"></svg-icon>
          <svg-icon icon-class="save-cirle" v-if="(showLeftIcon ||showRightIcon)&&scope.row.isSelected" @click="selectClick(scope.row,false)"></svg-icon>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="sort" label="序号" width="80">
        <template slot-scope="scope">
          <span v-if="!scope.row.sort.edit">{{scope.row.sort.value}}</span>
          <div v-if="scope.row.sort.edit" class="pr" style="height:40px;">
            <input type="text" class="sortInput text-c c-a6"  v-if="scope.row.id.value !=currentIndex||showInputBox" v-model="scope.row.sort.value" ref="sort">
            <div class="mask c-a6 fz12"  v-if="scope.row.id.value==currentIndex&&!showInputBox" @click.stop="showInput">
              <p>{{scope.row.sort.value}}</p>
              <svg-icon icon-class="edite-gray"></svg-icon>
              <span>修改</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="channel_name" label="预定渠道" width="100">
        <template slot-scope="scope">
          <span v-if="!scope.row.channel_name.edit">{{scope.row.channel_name.value}}</span>
          <div v-if="scope.row.channel_name.edit" class="pr">
            <el-select v-model="scope.row.channel_name.value"   v-if="scope.row.id.value !=currentIndex||showInputBox"
              placeholder="请选择渠道" ref="channel_name" popper-class="channel">
              <el-option v-for="(item, index) in channelArr" :key="index" :label="item.channel_name" :value="item.channel_name"></el-option>
            </el-select>
            <div class="mask" @click="showInputBox=true" v-if="scope.row.id.value==currentIndex&&!showInputBox">
              <svg-icon icon-class="edite-gray"></svg-icon>
              <p>选择<br>渠道</p>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="stock" label="库存" width="50">
        <template slot-scope="scope">
          <div :class="[isEdit&&currentIndex ==scope.row.id.value?'disable':'']">{{scope.row.stock.value }}</div>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="check_in_date" label="入住" width="120">
        <template slot-scope="scope">
          <span  v-if="!scope.row.check_in_date.edit">{{scope.row.check_in_date.value | formateDate }}</span>
          <div v-else >
              <el-date-picker
                v-model="scope.row.check_in_date.value"
                type="date"
                format=" MM 月 dd 日"
                @change=dateChange(scope.row)
                placeholder="选择日期">
              </el-date-picker>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="check_out_date" label="离店" width="120">
        <template slot-scope="scope">
           <span  v-if="!scope.row.check_out_date.edit">{{scope.row.check_out_date.value | formateDate }}</span>
           <div v-else>
             <el-date-picker
                v-model="scope.row.check_out_date.value"
                type="date"
                @change=dateChange(scope.row)
                format="MM 月 dd 日"
                placeholder="选择日期">
              </el-date-picker>
           </div>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="hotel_name" label="酒店" width="200">
        <template slot-scope="scope">
          <span v-if="!scope.row.hotel_name.edit">{{scope.row.hotel_name.value}}</span>
          <div v-else>
            <el-select v-model="scope.row.hotel_name.value"  filterable remote reserve-keyword
              placeholder="请输入关键词"
              value-key="id"
              :remote-method="remoteMethod"
              @change="hotelChange(scope.row)"
              :loading="loading">
              <el-option
                v-for="item in options"
                :key="item.id"
                :label="item.hotel_name"
                :value="item">
              </el-option>
            </el-select>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="room_type" label="房型名称" width="200">
        <template slot-scope="scope">
          <span v-if="!scope.row.room_type.edit">{{scope.row.room_type.value}}</span>
          <div v-else>
            <el-select v-model="scope.row.room_type.value"   v-if="scope.row.id.value !=currentIndex||showInputBox"
              placeholder="请选择房型"  popper-class="channel">
              <el-option v-for="(item, index) in rooms" :key="index" :label="item" :value="item"></el-option>
            </el-select>
            <div class="mask" @click="getRoom(scope.row)" v-if="scope.row.id.value==currentIndex&&!showInputBox">
              <svg-icon icon-class="edite-gray"></svg-icon>
              <p>请选择房型</p>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="bad_type" label="床型">
        <template slot-scope="scope">
          <div :class="[isEdit&&currentIndex ==scope.row.id.value?'disable':'']">{{scope.row.bad_type.value}}</div>
          
        </template>
      </el-table-column>
      <el-table-column align="center" prop="breakfast_type" label="早餐">
        <template slot-scope="scope">
          <div :class="[isEdit&&currentIndex ==scope.row.id.value?'disable':'']">{{scope.row.breakfast_type.value}}</div >
        </template>
      </el-table-column>
      <el-table-column align="center" prop="cancel_type" label="取消">
        <template slot-scope="scope">
          <div :class="[isEdit&&currentIndex ==scope.row.id.value?'disable':'']">{{scope.row.cancel_type.value}}</div>
          
        </template>
      </el-table-column>
      <el-table-column align="center" prop="breakfast_type" label="含税价">
        <template slot-scope="scope">
          <div :class="[isEdit&&currentIndex ==scope.row.id.value?'disable':'']">
            <p class="fw-600" :class="[scope.row.old_after_tax_price.value>scope.row.after_tax_price.value?'red':'green']">{{scope.row.old_after_tax_price.value||'N/A'}}</p>
            <p :class="[scope.row.old_after_tax_price.value<scope.row.after_tax_price.value?'red':'green']">{{scope.row.after_tax_price.value ||'N/A'}}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="conversion_price" label="换算价">
        <template slot-scope="scope">
          <div v-if="!scope.row.conversion_price.edit">
            <p class="fw-600" :class="[scope.row.old_conversion_price.value>scope.row.conversion_price.value?'red':'green']">{{scope.row.old_conversion_price.value||'N/A'}}</p>
            <p :class="[scope.row.old_conversion_price.value<scope.row.conversion_price.value?'red':'green']">{{scope.row.conversion_price.value ||'N/A'}}</p>
          </div>
          <div v-else class="calcBox pr">
             <el-popover placement="bottom" v-model="showCalcBox" width="211" trigger="click" popper-class="calc" @hide="scope.row.conversion_price.edit=false">
                <el-row class="btn">
                  <el-col :span="12" class="text-l"><svg-icon icon-class="close-white" class="text-l" @click="closeCalcBox"></svg-icon></el-col>
                  <el-col :span="12" class="text-r"><svg-icon icon-class="ok" class="text-r" @click="saveCalcRes(scope.row)"></svg-icon></el-col>
                </el-row>
                <el-row class="calcShow">
                  <el-col>{{str}} {{calcPrice}} </el-col>
                </el-row>
                <el-row class="calc-main">
                  <!-- <el-col><div class="calc-item bg-a4" >AC</div><div class="calc-item bg-a4">(/ )</div><div class="calc-item bg-a4">%</div><div class="calc-item bg-ff noMargin">÷</div></el-col>
                  <el-col><div class="calc-item bg-33" >7</div><div class="calc-item bg-33">8</div><div class="calc-item bg-33">9</div><div class="calc-item bg-ff noMargin">×</div></el-col>
                  <el-col><div class="calc-item bg-33" >4</div><div class="calc-item bg-33">5</div><div class="calc-item bg-33">6</div><div class="calc-item bg-ff noMargin">－</div></el-col>
                  <el-col><div class="calc-item bg-33" >1</div><div class="calc-item bg-33">2</div><div class="calc-item bg-33">3</div><div class="calc-item bg-ff noMargin">+</div></el-col>
                  <el-col><div class="calc-item bg-33 special" >0</div><div class="calc-item bg-33">%</div><div class="calc-item noMargin bg-ff">del</div></el-col> -->
                  <div class="calc-item" @click="itemClick(item)" v-for="(item, index) in calcArr" :key="index" :class="[item.class,item.isSpecial?'special':'',item.no?'noMargin':'']">{{item.value}}</div>
                </el-row>
                <el-button slot="reference">请选择</el-button>
             </el-popover>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="old_refresh_time" label="刷新时间">
        <template slot-scope="scope">
          <div :class="[isEdit&&currentIndex ==scope.row.id.value?'disable':'']" >
            <p>{{scope.row.old_refresh_time.value | formateTime}}</p>
            <p>{{scope.row.refresh_time.value | formateTime}}</p>
          </div>
          
        </template>
      </el-table-column>
      <el-table-column align="center" prop="refresh_type" label="刷新">
        <template slot-scope="scope">
          <div v-if="!scope.row.refresh_type.edit">
            <span v-if="scope.row.refresh_type.value==2">{{scope.row.timed_refresh_time.value}}</span>
            <svg-icon icon-class="time" v-if="scope.row.refresh_type.value==1" @click="initData(1,true)"></svg-icon>
          </div>
          <div v-else>
            <el-popover placement="bottom" trigger="click" v-model="showRefresh" popper-class="refreshBox" @hide="hideRefresh(scope.row)">
              <div class="header">
                <el-row class="fz26">
                  <el-col :span="12" class="text-l"><svg-icon icon-class="close" @click="showRefresh= false"></svg-icon></el-col>
                  <el-col :span="12" class="text-r"><svg-icon icon-class="check" @click="calcTime(scope.row,true)"></svg-icon></el-col>
                </el-row>
              </div>
              <el-radio-group v-model="scope.row.refresh_type.value">
                <div>
                  <el-radio :label="1">手动刷新</el-radio>
                </div>
                <div>
                  <el-radio :label="2">定时刷新 
                    <!-- <el-select v-model="scope.row.timed_refresh_time.value" filterable allow-create placeholder="请选择时间" popper-class="selectTime">
                      <el-option value="10">10秒刷新</el-option>
                      <el-option value="20">10秒刷新</el-option>
                      <el-option value="30">10秒刷新</el-option>
                      <el-option value="40">10秒刷新</el-option>
                      <div slot="prefix" class="fz26">
                        <svg-icon icon-class="time"></svg-icon>
                      </div>
                    </el-select> -->
                    <el-time-picker
                      v-model="timeStep"
                      :picker-options="{
                        selectableRange: '00:00:00 - 23:59:59'
                      }"
                      @change="calcTime(scope.row)"
                      placeholder="请选择时间">
                    </el-time-picker>
                  </el-radio>

                </div>
              </el-radio-group>
              <div slot="reference"><svg-icon icon-class="edite-gray"></svg-icon>编辑</div>
            </el-popover>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="remark" label="备注">
        <template slot-scope="scope">
          <span v-if="!scope.row.remark.edit">{{scope.row.remark.value}}</span>
          <div v-else>
            <el-input v-model="scope.row.remark.value" placeholder="请输入"></el-input>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" width="60">
        <template slot="header" slot-scope="scope">
            <svg-icon icon-class="copy" v-if="(showRightIcon && isAll) || (showRightIcon && isMany)" @click="copyMany"></svg-icon>
            <svg-icon icon-class="del" v-if=" (isAll || isMany)&&!showRightIcon" @click="delMany"></svg-icon>
        </template>
        <template slot-scope="scope">
          <svg-icon icon-class="del" v-if="defaultState &&!(isEdit &&(scope.row.id.value==currentIndex))" @click="delOne(scope.row)"></svg-icon>{{scope.row.isSlected}}
          <svg-icon icon-class="copy-gray"    v-if="showRightIcon&&!scope.row.isSelected" @click="copyOne(scope)"></svg-icon>
          <svg-icon icon-class="copy" v-if="showRightIcon&&scope.row.isSelected"   @click="copyOne(scope)"></svg-icon>
          <svg-icon icon-class="del-gray" v-if="showLeftIcon"  @click="delOne(scope.row)"></svg-icon>
           <svg-icon icon-class="ok-blue"  v-if="isEdit &&(scope.row.id.value==currentIndex)" @click=saveEdit(scope.row)></svg-icon>
        </template>
      </el-table-column>
    </el-table>
  </div>
 </div>
</template>

<script>
import workState from '@/components/workState'
import user from '@/components/user'
import Sortable from 'sortablejs'
import { dateFormat } from '@/utils'
export default {
  data() {
    return {
      isEdit:false,
      calcArr:[
        {id:1,value:'AC',class:'bg-a4',isSpecial:false,no:false },
        {id:2,value:'( )',class:'bg-a4',isSpecial:false,no:false ,isSel:false},
        {id:3,value:'%',class:'bg-a4',isSpecial:false,no:false },
        {id:4,value:'÷',class:'bg-ff',isSpecial:false,no:true },
        {id:5,value:'7',class:'bg-33',isSpecial:false,no:false },
        {id:6,value:'8',class:'bg-33',isSpecial:false,no:false },
        {id:7,value:'9',class:'bg-33',isSpecial:false,no:false },
        {id:8,value:'×',class:'bg-ff',isSpecial:false,no:true },
        {id:9,value:'4',class:'bg-33',isSpecial:false,no:false },
        {id:10,value:'5',class:'bg-33',isSpecial:false,no:false },
        {id:11,value:'6',class:'bg-33',isSpecial:false,no:false },
        {id:12,value:'－',class:'bg-ff',isSpecial:false,no:true },
        {id:14,value:'1',class:'bg-33',isSpecial:false,no:false },
        {id:15,value:'2',class:'bg-33',isSpecial:false,no:false },
        {id:16,value:'3',class:'bg-33',isSpecial:false,no:false },
        {id:17,value:'+',class:'bg-33',isSpecial:false,no:true },
        {id:18,value:'0',class:'bg-33',isSpecial:true,no:false },
        {id:19,value:'.',class:'bg-33',isSpecial:false,no:false },
        {id:20,value:'del',class:'bg-ff',isSpecial:false,no:true },
      ],
      interval:'',
      refresh:{},
      showWorkSetting:false,
      showTips:false,
      showOffWork:false,
      showWork:false,
      offTime:'',
      workTime:'',
      showLeftIcon:false,
      showRightIcon:false,
      defaultState:true,
      showMask:false,
      pageSize:20,
      pageNumber:1,
      tableData:[],
      hotel:'',
      isAdd:false,
      isAll:false,
      userInfo:{
        // headimgurl:'',
        // nickname:'',
        // tel:'',
        // remaining_number:''
      },
      workInfo:{},
      dataModel:{},
      channelArr:[],
      channel:'',
      currentIndex:'',
      showInputBox:false,
      options:[],
      loading:false,
      rooms:[],
      selectedData:[],
      isMany: false,
      total:0,
      showRefresh:false,
      isDisable:false,
      timeStep:10,
      str:'含税价',
      calcPrice:'',
      bool:true,
      showCalcBox:false,
      showDisable:false
    }
  },
  created(){
    this.initData()
  },
  mounted() {
    document.addEventListener('click',(e)=>{
      let dom = document.querySelector('.tips')
      if(dom&&!dom.contains(e.target)) {
        this.showTips = false
      }
    })
    this.$nextTick(()=>{
      this.setSort()
    })
  },
  methods: {
    async initData(pageNumber=1,reset=true) {
      if(reset){
        Object.assign(this.$data, this.$options.data())
      }
      let data = await this.$api.getIndexData({pageSize:this.pageSize,pageNumber:pageNumber})
      if(data) {
        let { working_time, work_state,closing_time,tel,nickname,remaining_number,headimgurl,unit_price} = data
        this.workInfo = {working_time,work_state,closing_time}
        this.userInfo = { tel,nickname,remaining_number,headimgurl,unit_price}
        this.tableData = this.fomateData(data.page.list)
        this.channelArr = data.channels
        this.total = data.page.totalRow
      }

    },
    async pageChange(data) {
      this.pageNumber = data
      this.initData(data,false)
    },
    hideRefresh(data) {
      data.refresh_type.edit=false
      if(!data.refresh_type.value) {
        data.refresh_type.value = 1
      }
    },
    hotelChange(data){
      let hotel_name = data.hotel_name.value.hotel_name
      let hotel_id = data.hotel_name.value.id
      data.hotel_name.value =hotel_name
      data.hotel_id.value =hotel_id
      this.getRoom(data)
    },
    async getRoom(data) {
      this.showInputBox=true
      let res = await this.$api.getRoomTypes({
        hotel_id:data.hotel_id.value,
        channel_id:data.channel_id.value,
        check_in_date:data.check_in_date.value,
        check_out_date:data.check_out_date.value,
      })
      if(res.length>0) {
        this.rooms = res
      }else {
        this.$message({
          message:'此期间该渠道该酒店的房型已售罄！',
          type:'error'
        })
      }
    },
    // 拼接数据是否编辑状态
    fomateData(data,type=false) {
     if(Array.isArray(data)){
       data.forEach(item => {
         for(let v in item) {
           item[v] = {
             value:item[v],
             edit:type
           }
         }
         item.isSelected = false
       })
     } else {
       for(let v in data) {
           data[v] = {
             value:data[v],
             edit:type
           }
         }
        data.isEdit = true
     }
      return data
    },
    cellClick(row,column,cell,event) {
      this.isEdit = true
      this.currentIndex = row.id.value
      let arr = ['stock','bad_type','breakfast_type','cancel_type','old_refresh_time']
      let res = arr.indexOf(column['property'])
      if(res!= -1 ){
        this.isDisable=true
      } else {
        if(row[column['property']]) {
          row[column['property']].edit = true
          row[column['property']].value = ''
        }

      }
      setTimeout(() => {
        this.$refs[column.property]&&this.$refs[column.property].focus()
      }, 20)
    },
    showInput() {
      this.showInputBox = true
    },
    setSort() {
      let _this = this
      const el = this.$refs.dragTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost', 
        handle: '.dragBtn',
        sort:true,
        setData: function(dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd:async function(e) {
          console.log(e.oldIndex)
          let currentRow = _this.tableData[e.oldIndex]
          let sort = currentRow.sort.value + (e.newIndex - e.oldIndex)
          await _this.$api.dragSortr({id:currentRow.id.value,sort:sort})
          _this.initData()
        }
      })
    },
    async remoteMethod(data) {
      if(!data) return
      let res = await this.$api.getHotelInfoByKeyword({keyword:data})
      this.options = res
    },
    selMany() {
      this.showLeftIcon = true
      this.isAdd = this.defaultState = this.showRightIcon = false
    
    },
    add() {
      this.showLeftIcon = this.showRightIcon = false
      this.defaultState = true
      // let obj = {
      //   sort: this.tableData.length,
      //   channel_id: 'N/A',
      //   hotel_id: '',
      //   room_type: '请选择',
      //   check_in_date: '',
      //   check_out_date: '',
      //   refresh_type: '',
      //   timed_refresh_time: '',
      //   conversion_formula: '',
      //   remark: '',
      //   id: '',
      //   hotel_name:'',
      //   breakfast_type:'N/A',
      //   bad_type:'N/A',
      //   conversion_price:'',
      //   breakfast_type:'N/A',
      //   cancel_type:'N/A',
      //   channel_name:'',
      //   stock:'N/A',
      //   old_refresh_time:'',
      //   refresh_time:'',
      // }
      // let obj = Object.assign({},this.tableData[0])
      let obj = JSON.parse(JSON.stringify(this.tableData[0]))
      for(let p in obj) {
        if(typeof obj[p]=='object') {
          obj[p].value = ''
          obj[p].edit = true

        }else {
          obj[p] = false
        }
      }
      obj.cancel_type.value='N/A'
      obj.bad_type.value='N/A'
      obj.breakfast_type.value='N/A'
      obj.stock.value='N/A'
      this.isEdit = true
      this.tableData.unshift(obj) 
    },
    copy() {
      this.showRightIcon = true
      this.defaultState = this.showLeftIcon = this.isMany = false
      this.selectedData = []
      this.tableData.forEach(item=> {
        item.isSelected = false
      })
    },
    selectClick(data,type=false) {
      data.isSelected = !data.isSelected
    //  this.$nextTick(()=>{
        this.tableData.forEach(item=>{
        if(item.id.value == data.id.value) {
          item.isSelected = data.isSelected
        }
      })
      this.selectedData = this.tableData.filter(item=>{
        return item.isSelected == true
      })
      if(this.selectedData.length == this.tableData.length) {
        this.isAll = true
      }else {
        this.isAll = false
      }
      if(this.selectedData.length >=2) {
        this.isMany = true
      }else {
        this.isMany = false
      }
    },
    changeState() {
      this.initData()
    },
    selAll() {
      this.isAll = true
      this.tableData.forEach(item=>{
        item.isSelected = true
      })
      this.selectedData = this.tableData
    },
    clearAll() {
      this.isAll = false
      this.isMany = false
      this.tableData.forEach(item=> {
        item.isSelected = false
      })
      this.selectedData = []
    },
    async copyOne(data) {
      data.row.isSelected = !data.row.isSelected
      this.tableData.forEach(item=> {
        if(item.id.value == data.row.id.value) {
          item.isSelected = data.row.isSelected
        }
      })
     let res = await this.$api.copyQueryOrder({ids:data.row.id.value})
     if(res.msg=="SUCCESS") {
       this.$message({
         message:'复制成功',
         type:'success'
       })
     }else {
       this.$message({
         message:'复制失败',
         type:'error'
       })
     }
     this.initData()
    },
    async delOne(data) {
      let id = data.id.value
      let res = await this.$api.delQueryOrder({ids:id})
      if(res.msg=="SUCCESS") {
       this.$message({
         message:'删除成功',
         type:'success'
       })
     }else {
       this.$message({
         message:'删除失败',
         type:'error'
       })
     }
     this.initData()
    },
    async copyMany() {
       let str =''
      this.selectedData.forEach(item=>{
        str =item.id.value+','+str
      })
     let res = await this.$api.copyQueryOrder({ids:str})
      if(res.msg=="SUCCESS") {
        this.$message({
          message:'复制成功',
          type:'success'
        })
      }else {
        this.$message({
          message:'复制失败',
          type:'error'
        })
      }
      this.initData()
    },
   async delMany() {
      let str =''
      this.selectedData.forEach(item=>{
        str =item.id.value+','+str
      })
     let res = await this.$api.delQueryOrder({ids:str})
      if(res.msg=="SUCCESS") {
        this.$message({
          message:'删除成功',
          type:'success'
        })
      }else {
        this.$message({
          message:'删除失败',
          type:'error'
        })
      }
      this.initData()
    },
   async saveEdit(data){
     let begin = new Date(data.check_in_date.value).getTime()
      let end = new Date(data.check_out_date.value).getTime()
      if(begin>end) {
        this.$message({
          message:'离店日期必须大于入住日期',
          type:'error'
        })
        return 
      }
      this.isEdit = false
      let obj = {
        sort: data.sort.value,
        channel_id: data.channel_id.value,
        hotel_id: data.hotel_id.value,
        room_type: data.room_type.value,
        check_in_date: data.check_in_date.value,
        check_out_date: data.check_out_date.value,
        refresh_type: data.refresh_type.value,
        timed_refresh_time: data.timed_refresh_time.value,
        conversion_formula: data.conversion_formula.value,
        remark: data.remark.value,
        id: data.id.value,
        // hotel_name:data.hotel_name.value
      }
      let res = await this.$api.updQueryOrder(obj)
        if(res.msg=="SUCCESS") {
          this.$message({
            message:'更新成功',
            type:'success'
          })
        }else {
          this.$message({
            message:'更新失败',
            type:'error'
          })
        }
        this.initData(this.pageNumber,false)
    },
    closeEdit() {
      this.initData()
    },
    dateChange(data) {
      let begin = new Date(data.check_in_date.value).getTime()
      let end = new Date(data.check_out_date.value).getTime()
      if(begin>end) {
        this.$message({
          message:'离店日期必须大于入住日期',
          type:'error'
        })
      }
    },
    calcTime(data,type=false) {
      if(type){
        this.showRefresh= false
      }
      let res =  dateFormat('HH:MM:SS',this.timeStep)
      let arr = res.split(':')
      let timed = Number(arr[0])*3600+Number(arr[1])*60+Number(arr[2])
      data.timed_refresh_time.value = timed
    },
    itemClick(data) {
      if(data.id==1) {
        this.calcPrice = ''
        return
      }
      if(data.id ==20) {
        this.calcPrice = this.calcPrice.substring(0,this.calcPrice.length-1)
        return
      }
      if(data.id==2) {
        if(this.bool) {
          this.bool = false
            this.calcPrice += '('
          }else {
            this.bool = true
          this.calcPrice += ')'
        }
        return
      }
      this.calcPrice += data.value
    },
    closeCalcBox() {
      this.calcPrice = ''
      this.showCalcBox = false
    },
    saveCalcRes(data) {
      data.conversion_formula.value = this.str+this.calcPrice
      this.calcPrice = ''
      this.showCalcBox = false
    }
  },
  filters: {
    formateDate(val) {
      if(!val) return 'null'
      let res = dateFormat('mm月dd日',val)
      return res
    },
    formateTime(val) {
      if(!val) return 'null'
      return dateFormat('HH:MM',val)
    }
  },
  components: {
    workState,
    user
  }
} 
</script>


<style lang="less">
.index {
  width: 100%;
  height: 100%;
  background: linear-gradient(#a6dbfa 0%,#fff 50%);
  .header {
    padding: 35px 0 77px 77px;
  }
 
  .tips {
    width: 99%;
    background-color: rgba(0,0,0,.7);
    border-radius: 8px;
    position: absolute;
    top: 21px;
    left: 50%;
    z-index: 100;
    transform: translateX(-50%);
    padding: 10px  0  30px 0;
    .tip-item {
      margin-bottom: 10px;
    }
  }
  .main {
    margin: 0 72px;
    padding-bottom: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    .pagination {
      top: 0;
      left: 40px;
      .el-pagination {
        .btn-next {
          background-color: rgba(0,0,0,0);
          color: #2a82e4;
        }
        .btn-prev {
          background-color: rgba(0,0,0,0);
          color: #2a82e4;
        }
        // .el-pager li  {
        //   background-color: #fff;
        //   color: #2a82e4;
        // }
      }
    }
    .menu {
      margin-bottom: 20px;
      height: 30px;
      line-height: 30px;
      width: 180px;
      .icon-add {
        
      }
      .cp {
        position: absolute;
        &.left {
          left: 0;
          top: 0;
        }
        &.right {
          right: 0;
          top: 0;
        }
        &.middle {
          left: 50%;
          top: 8px;
        }
      }
    }
    .table {
      border-radius: 38px;
      background-color: #b9e8fc;
      padding-bottom: 40px;
      td {
        border-bottom: 1px solid #b9e8fc;
        border-right: 1px solid #b9e8fc;
      }
      .cell {
        // padding:0;
        // overflow: auto;
      }
      .sortInput {
        width: 100%;
        height: 100%;
      }
      .el-input__inner{
        border:none;
        outline: none;
        white-space: pre-wrap;
        word-break: break-all;
        // text-align: center;
        padding-left:10px;
        padding-right:0;
      }
      .el-table__header {
        th {
          background-color: #b9e8fc;
          color: #333;
        }
      }
      .el-table__body {
        .el-table__row {
          td {
            &:nth-child(1){
              background-color: #b9e8fc;
              border-bottom: 1px solid  #b9e8fc;
            }
            &:nth-last-child(1){
              background-color: #b9e8fc;
              border-bottom: 1px solid  #b9e8fc;
            }
          }
        }

      }
    }
  }
 
 .el-table th.is-leaf {
    border-bottom: 1px solid #b9e8fc;
    border-right: 1px solid #b9e8fc;
  }
}

.b-fz {
  font-weight: bold;
  transform: scale(1.4);
  
}
.el-select-dropdown {
  border-radius: 0 0 20px 20px;
}
.channel {
  .el-select-dropdown__list {
  padding: 0;
}
.el-select-dropdown__item{
  background-color: #aedaed;
  color: #505050;
  &:hover {
    background-color: rgba(0, 0, 0, .3);
  }
  &.hover {
     background-color: rgba(0, 0, 0, .3);
  }
  &:last-child {
    border-radius: 0 0 20px 20px;
  }
}
}

.mask {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  .svg-icon {
    margin-right: 10px;
  }
}
.calc {
 background-color: #6f6e69;
 padding: 0;
 border-radius: 0 0 20px 20px;
 .btn {
   background-color: #383838;
   height: 24px;
   line-height: 24px;
   padding: 0 10px;
 }
 .calcShow {
   background-color: #5a5a53;
   height: 54px;
   line-height: 54px;
   color: #fff;
   padding-left:12px;
 }
 .calc-main {
   padding: 11px 20px 24px 20px;
   .calc-item {
     display: inline-block;
     width: 37px;
     height: 37px;
     margin-right: 7px;
     margin-bottom: 7px;
     border-radius: 50%;
     color: #fff;
     text-align: center;
     line-height: 37px;
     &.noMargin {
       margin-right: 0;
     }
     &.special {
       width: 81px;
       border-radius: 18px;
     }
     &:nth-child(-3+n){
       color: #000;
     }
   }
 }
}

.refreshBox {
  width: 367px;
  height: 124px;
  background-color: #aedaed;
  border-radius: 20px;
  padding: 7px;
  .el-radio-group {
    margin: 10px 20px;
  }
  .el-select {
    width: 170px;
    .el-input__prefix {
      right: 5px;
      text-align: right;
      line-height: 40px;
      font-size: 20px;
    }
  }
  .el-radio-group {
    .el-date-editor.el-input {
      width: 50%;
    }
  }
}
.disable {
  background-color: #ccc;
}
</style>