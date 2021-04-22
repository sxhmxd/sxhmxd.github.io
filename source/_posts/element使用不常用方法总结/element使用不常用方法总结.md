---
title: [element使用不常用方法总结]
categories: [element使用不常用方法总结]
---

## el-table  相同列进行合并

```
  <el-table
      :data="tableDataqingkaung"
      border
      style="width: 100%"
      :span-method="objectSpanMethod"
      :row-class-name="tableRowClassName"
    >
      <el-table-column label="ID" prop="date" width="100" align="center">
      </el-table-column>
      <el-table-column
        label="供电分区代码/影响区域"
        prop="options"
        align="center"
        width="300"
      >
        <template slot-scope="scope">
          <span v-html="scope.row.options"></span>
        </template>
      </el-table-column>

      <el-table-column label="行车调整原则" prop="rules">
        <template slot-scope="scope">
          <span v-html="scope.row.rules"></span>
        </template>
      </el-table-column>
    </el-table>
/*
* data 传入的参数
* rules 判断的属性值
*/
  getSpanArr(data) {
      this.spanArr = []
      for (var i = 0; i < data.length; i++) {
        if (i === 0) {
          this.spanArr.push(1);
          this.pos = 0
        } else {
          // 判断当前元素与上一个元素是否相同  inAccessCode（批次字段）
          if (data[i].rules == data[i - 1].rules) {
            this.spanArr[this.pos] += 1;
            this.spanArr.push(0);
          } else {
            this.spanArr.push(1);
            this.pos = i;
          }
        }
      }
    },

    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 2) {  // 指定那一列进行合并
        const _row = this.spanArr[rowIndex];
        const _col = _row > 0 ? 1 : 0;
        return {
          rowspan: _row,
          colspan: _col
        }
      }
    },

```