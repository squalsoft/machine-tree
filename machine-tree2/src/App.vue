<template>
  <div id="app">
    <table class="top">
      <tr>
        <td><label for="fio">ФИО</label></td>
        <td><input type="text" id="fio" class="init-name" /></td>
      </tr>
      <tr>
        <td><label for="gr">Группа</label></td>
        <td><input type="text" id="gr" class="init-name" /></td>
      </tr>
      <tr>
        <td><label for="teacher">Преподаватель</label></td>
        <td><input type="text" id="teacher" class="init-name" /></td>
      </tr>
    </table>
    <h1 style="text-align: center">
      Диагностическая модель <input type="text" v-model="modelName" />
    </h1>
    <form id="main-form">
      <label for="main-param">Главный (интегральный) параметр</label>
      <input type="text" id="main-param" />
      <input type="submit" value="Добавить" />
    </form>

    <form id="question-form">
      <label for="question-param" id="question-label"></label>
      <br />
      <input type="button" id="cancel" value="Ни на что больше" />
      <input type="text" id="question-param" />
      <input type="submit" value="Ок" />
    </form>

    <!-- https://github.com/ssthouse/vue-tree-chart   -->
    <vue-tree
      style="width: 100%; height: 1000px; border: 1px solid gray"
      :dataset="sampleData"
      :config="treeConfig"
      :collapse-enabled="false"
    >
      <template v-slot:node="{ node, collapsed }">
        <span
          class="tree-node"
          :style="{ border: collapsed ? '2px solid grey' : '' }"
          >{{ node.value }}</span
        >
      </template>
    </vue-tree>

    <br />
    <h2>Характеристики диагностической модели {{ modelName }}</h2>
    <table
      class="details"
      id="details-table"
      border="1"
      cellpadding="0"
      cellspacing="0"
    >
      <tr>
        <th rowspan="2">№ параметра</th>
        <th rowspan="2">Наименование неисправности</th>
        <th rowspan="2">Номер прямого параметра (элемента модели)</th>
        <th rowspan="2">Номер соответствующего косвенного параметра</th>
        <th rowspan="2">Априорное время изменения, мин</th>
        <th colspan="4">
          Критерии оптимизации построения условных алгоритмов поиска дефекта
        </th>
      </tr>
      <tr>
        <th>Вероятностный критерий</th>
        <th>Временной критерий</th>
        <th>Экономический критерий</th>
        <th>Информационные критерии</th>
      </tr>
      <tbody class="char-body"></tbody>
    </table>

    <div id="dialog" title="Редактирование">
      <input id="del-node" type="button" value="Удалить" />
      <table>
        <tr>
          <td id="parent-name"></td>
          <td>
            <input type="text" id="parent-descr" />
            <input type="button" id="save-parent-descr" value="Сохранить" />
          </td>
        </tr>
        <tr>
          <td>На что влияет ?</td>
          <td>
            <input type="text" id="new-child" />
            <input id="add-node" type="button" value="Добавить" />
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
// https://github.com/ssthouse/vue-tree-chart
// https://vuejsexamples.com/flowchart-flowchart-designer-component-for-vue-js/
// https://vuejsexamples.com/flowchart-of-mermaid-with-vue-componet/
export default {
  name: "App",
  components: {},
  data() {
    return {
      modelName: "",
      nodes: [],
      mainNodes: [],
      sampleData: {
        value: "1",
        children: [
          { value: "2", children: [{ value: "4" }, { value: "5" }] },
          { value: "3" },
        ],
      },
      treeConfig: {
        nodeWidth: 50,
        nodeHeight: 30,
        levelHeight: 50,
      },
    };
  },
};
</script>

<style>
.tree-node {
  display: inline-block;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: rgb(236, 236, 236);
  text-align: center;
  line-height: 28px;
  font-weight: bold;
  border-color: black;
  border-width: 1px;
  border-style: solid;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
input {
  margin: 5px;
}
.top {
  text-align: right;
}
td,
th {
  padding: 5px;
}
#details-table {
  margin: 5px auto;
}
.init-name {
  width: 300px;
}
</style>
