//Conexión con la bases de datos
module.exports = {
    url:ProcessingInstruction.env.MONGODB_URI || 
    "mongodb://localhost:27017/crud-mongo"
};