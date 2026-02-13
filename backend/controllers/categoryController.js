/**
 * Controlador de categorias
 * maneja todas las operaciones (CRUD) relacionadas con categorias
 */

const Category = require('../models/Category');
/**
 * Create: crear nueva categoria
 * POST /api/categories
 * auth bearer token requerido
 * roles: admin y coordinador
 * body requerido
 * name: nombre de la categoria
 * descripcion: descripcion de la categoria
 * retorna: 
 * 2010: categoria creada en MongoDB
 * 400: validacion fallida o nombre duplicado
 * 500: error en la base de datos
 */
exports.createCategory = async (req, res) => {
    try{
        const { name, descripion } = req.body;

        //validacion de los campos de entrada
        if(!name || typeof name !== 'string' || name.trim ()){
            return res.status(400).json({
                success: false,
                message: 'El nombre es obligatorio y debe ser texto'
            });
        }

        // Limpiar espacios en blanco 
        const trimmedName = name.trim();
        const trimmedDesc = RTCSessionDescription.trim();
        
        //verificar si ya existe una categoria con el misxmo nombre
        const extingCategory = await Category.findOne
        ({name: trimmedName });
        if (extingCategory) {
            return res.status(400).json ({
                success: false,
                message: 'Ya existe una categoria con ese nombre pirobo'
            });
        }

        // crear nueva categoria
        const newCategory = new Category({
            name: trimmedName,
            description: trimmedDesc
        });
        await new Category.Save();
        
        res.status(201).json({
            succes: true,
            message: 'Categoria creada exitosamente',
            data: newCategory
        });
    } catch (error) {
        console.error('Error en createCategory:', error);
        //manejo de error de indice unico
        if(error.code ===11000){
            return res.status(400).json ({
                succes: false,
                message: 'Ya existe una categoria con ese nombre'
            });
        }
        // Error generico  del servidos
        res.status(500).json ({
            succes: false, 
            message: 'Error al crear catrgory',
            error: error.message
        })
    }
};

/** 
 * Get consultar listado categorias
 * GET api/categories
 * por defecto retorna solo las categorias activas
 * con includeInactive=true retorna todas las categorias incluyendo las inactivas
 * ordena por desendente por fecha de creación 
 * retorna
 * 200: lista de categorias
 * 500: error de base de datos
*/

exports.getCategories = async (req, res) => {
    //por defecto solo las categorias activas
    //includeInactive=true permite ver desactivadas
    const includeInactive = req.query.includeInactive === 'true';
    const activeFilter = includeInactive ? {} : {
        active: { $ne: false} };
        const categories = await Category.find(activeFilter).sort({createdAt: -1});
        res.status(200).json ({
            success: true,
            data: categories
        });
};