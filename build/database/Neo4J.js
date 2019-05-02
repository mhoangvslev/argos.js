'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Neo4J = void 0;

var Neode = _interopRequireWildcard(require("neode"));

var _Database = _interopRequireDefault(require("./Database"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

class Neo4J extends _Database.default {
  /**
   * Create a connection to Neo4J database
   * @param {string} bolt neo4j bolt
   * @param {string} username neo4j username
   * @param {string} password neo4j password
   */
  constructor(bolt, username, password) {
    super();
    this.dbInstance = new Neode(bolt, username, password);
  }
  /**
   * Load a model from file
   * @param {string} pathToModel relative path from current directory to model
   * @param {string} alias alias
   */


  createModel(pathToModel, alias) {
    this.modelAlias = alias;
    this.dbInstance.with({
      alias: require('' + pathToModel)
    });
    this.dbInstance.deleteAll(alias).then(() => {
      console.log("Reset database");
    });
  }
  /**
   * Relate two given nodes
   * @param {Neode.Node<any>} start start node
   * @param {Neode.Node<any>} end end node
   * @param {string} startToEnd relationship name from model
   * @param {string} endToStart relationship name from model
   * @param {object} relProps relationship properties
   */


  dbRelateNodes(start, end, startToEnd, endToStart, relProps) {
    // Create relationships
    start.relateTo(end, startToEnd, relProps).catch(error => {
      console.log("Could not relate nodes", error);
    });
    end.relateTo(start, endToStart, relProps).catch(error => {
      console.log("Could not relate nodes", error);
    });
    ;
  }
  /**
   * Create a pair of nodes then relate them
   * @param {object} startProps conditions to match start node
   * @param {object} endProps conditions to match end node
   * @param {string} startToEnd relationship name from model
   * @param {string} endToStart relationship name from model
   * @param {object} relProps conditions to relate nodes
   */


  dbCreateNodes(startProps, endProps, startToEnd, endToStart, relProps) {
    // Find nodes
    Promise.all([this.dbInstance.mergeOn(this.modelAlias, startProps, startProps), this.dbInstance.mergeOn(this.modelAlias, endProps, endProps)]).then( // On fullfilled
    ([start, end]) => {
      this.dbRelateNodes(start, end, startToEnd, endToStart, relProps);
    }, // On rejected
    error => {
      console.log("Could not create/update node", error);
    });
  }

}

exports.Neo4J = Neo4J;