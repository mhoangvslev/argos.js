"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Neo4J_1 = __importDefault(require("../database/Neo4J"));
var DatabaseFactory = /** @class */ (function () {
    function DatabaseFactory() {
    }
    /**
     * Create a database instance
     * @param {Neo4JConstructor} args the arguments corresponding to the class
     * @returns {Neo4J} a database instance or nothing
     */
    DatabaseFactory.createDbInstance = function (args) {
        var instance = Neo4J_1.default.createInstance(args.bolt, args.username, args.password, args.enterpriseMode, args.driverConf);
        instance.dbCreateModel(args.model);
        return instance;
    };
    return DatabaseFactory;
}());
exports.DatabaseFactory = DatabaseFactory;
exports.default = DatabaseFactory;
