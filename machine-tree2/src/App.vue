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
      <input type="text" id="main-param" v-model="mainNodeTitle" />
      <input type="submit" value="Добавить" @click.prevent="addRootNode" />
    </form>

    <!-- https://github.com/ssthouse/vue-tree-chart   -->
    <vue-tree
      :key="componentKey"
      style="width: 100%; height: 400px; border: 1px solid gray"
      :dataset="mainTree"
      :config="treeConfig"
      :collapse-enabled="false"
    >
      <template v-slot:node="{ node, collapsed }">
        <span
          @click="showEdit(node)"
          :title="node.title"
          v-if="node.value"
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
      <tbody class="char-body">
        <tr v-for="node in allNodes" :key="node.value">
          <td>{{ node.value }}</td>
          <td>{{ node.title }}</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>

    <!-- https://euvl.github.io/vue-js-modal/Intro.html#static-modals -->
    <modal name="edit-dialog">
      <h2>Редактирование</h2>
      <input id="del-node" type="button" value="Удалить" @click="delCurNode" />
      <br />
      <table>
        <tr>
          <td id="parent-name">{{ curNode.value }}</td>
          <td>
            <input type="text" id="parent-descr" v-model="curNode.title" />
            <input
              type="button"
              id="save-parent-descr"
              @click="saveCurNode"
              value="Сохранить"
            />
          </td>
        </tr>
        <tr>
          <td>На что влияет ?</td>
          <td>
            <input type="text" id="new-child" v-model="newNodeTitle" />
            <input
              id="add-node"
              type="button"
              value="Добавить"
              @click="addNewNode"
            />
          </td>
        </tr>
      </table>
      <br />
      <button @click="closeEdit">Закрыть</button>
    </modal>
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
      componentKey: 0,
      newNodeTitle: "",
      mainNodeTitle: "",
      modelName: "",
      mainTree: {},
      sampleData: {
        value: "1",
        title: "test",
        children: [
          { value: "2", children: [{ value: "4" }, { value: "5" }] },
          { value: null, children: [{ value: "3" }] },
        ],
      },
      treeConfig: {
        nodeWidth: 50,
        nodeHeight: 30,
        levelHeight: 50,
      },
      curNode: {},
      allNodes: [],
    };
  },
  methods: {
    forceRerender() {
      this.componentKey += 1;
      this.allNodes = this.getChildNodesWithParent(this.mainTree).sort(
        (a, b) => a.value - b.value
      );
    },
    addRootNode() {
      this.mainTree.value = "0";
      this.mainTree.title = this.mainNodeTitle;
      this.mainNodeTitle = "";
      this.forceRerender();
    },
    showEdit(curNode) {
      this.curNode = curNode;
      this.$modal.show("edit-dialog");
      this.newNodeTitle = "";
    },
    closeEdit() {
      this.$modal.hide("edit-dialog");
    },
    delCurNode() {
      let node = this.findNodeByVal(this.mainTree, this.curNode.value);
      if (node.parent) {
        node.parent.children = node.parent.children.filter((c) => c != node);
        this.addFakeNodes(this.mainTree);
        this.recalcValues(this.mainTree);
        this.forceRerender();
      }
      this.closeEdit();
    },
    saveCurNode() {
      // Поиск узла и его обновление
      let node = this.findNodeByVal(this.mainTree, this.curNode.value);
      node.title = this.curNode.title;
      this.closeEdit();
    },
    findNodeByVal(node, val) {
      // Проход по дереву в поисках узла
      if (node.value === val) return node;
      if (!node.children) return null;

      for (const childNode of node.children) {
        const res = this.findNodeByVal(childNode, val);
        if (res !== null) {
          return res;
        }
      }

      return null;
    },

    addNewNode() {
      if (!this.curNode.children) {
        this.curNode.children = [];
      }

      // Пересчёт value по уровням
      this.curNode.children.push({
        value: "-1",
        title: this.newNodeTitle,
        parent: this.curNode,
      });

      this.addFakeNodes(this.mainTree);
      this.recalcValues(this.mainTree);
      this.forceRerender();
      this.closeEdit();
    },

    // Добавить фейковые ноды, чтобы добить высоту листьев до максимума
    addFakeNodes(node) {
      // Сначала убираем фейковые ноды
      this.removeFakeNodes(node);
      // Находим макс высоту и делаем листья такой высоты
      const maxLevel = this.getMaxTreeLevel(node);
      const leafs = this.getLeafs(node);
      for (const leaf of leafs) {        
        // Добиваем лист до высоты дерева, если необходимо
        const newNodesCnt = maxLevel - leaf.level;
        if(newNodesCnt === 0) { continue; }

        let parent = leaf.parent;
        parent.children = parent.children.filter(c => c !== leaf);


        for (let i = 0; i < newNodesCnt; i++) {
          const fakeNode = { value:null, parent:leaf.parent, children: [] };
          fakeNode.parent = parent;
          parent.children.push(fakeNode);
          parent = fakeNode;
        }

        leaf.parent = parent;
        parent.children.push(leaf);
      }
    },

    removeFakeNodes(node) {
      if (!node.value) {
        // Это фейковый узел. Убираем
        const parent = node.parent;
        parent.children = parent.children.filter((c) => c != node);
        // Переставляем дочерние ноды в родительский
        parent.children = parent.children.concat(node.children);
        for (const childOfFake of node.children) {
          childOfFake.parent = parent;
        }
      }

      if(!node.children) { return; }

      for (const childNode of node.children) {
        this.removeFakeNodes(childNode);
      }
    },

    // Получение листьев
    getLeafs(node, level = 0) {
      let leafs = [];

      if (!node.children) {
        node.level = level;
        // Это лист
        leafs.push(node);
        return leafs;
      }

      const nextLevel = level + 1;
      // Ищем листья в дочерних
      for (const childNode of node.children) {        
        const childLeafs = this.getLeafs(childNode, nextLevel);
        leafs = leafs.concat(childLeafs);
      }

      return leafs;
    },

    // Глубина дерева
    getMaxTreeLevel(node, level = 0) {
      let maxLevel = level;
      if (node.children) {
        const nextLevel = maxLevel + 1;

        for (const childNode of node.children) {          
          const levelMaxVal = this.getMaxTreeLevel(childNode, nextLevel);
          if (levelMaxVal > maxLevel) {
            maxLevel = levelMaxVal;
          }
        }
      }
      return maxLevel;
    },
    // Узлы без фейковых
    getNodesByLevel(node, level, prevLevel) {
      let nodes = [];

      let curLevel = prevLevel + 1;
      if (level === curLevel && node.value !== null) {
        nodes = nodes.concat(node);
        return nodes;
      }

      // Ищем в дочерних
      if (node.children) {
        for (const childNode of node.children) {
          const childNodes = this.getNodesByLevel(childNode, level, curLevel);
          nodes = nodes.concat(childNodes);
        }
      }
      return nodes;
    },

    recalcValues(tree) {
      let val = 0;
      // Надо сделать проход по уровням дерева
      // Сначала получаем кол-во уровней дерева, потом по ним проходим
      const maxLevel = this.getMaxTreeLevel(tree, 0);
      for (let i = 0; i <= maxLevel; i++) {
        const levelNodes = this.getNodesByLevel(this.mainTree, i, -1);
        for (const lNode of levelNodes) {
          lNode.value = val.toString();
          val++;
        }
      }
    },

    // Для получения всех узлов
    getChildNodesWithParent(node) {
      let nodes = [];
      if (node.value) {
        nodes.push(node);
      }

      if (node.children) {
        for (const childNode of node.children) {
          nodes = nodes.concat(this.getChildNodesWithParent(childNode));
        }
      }
      return nodes;
    },
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
