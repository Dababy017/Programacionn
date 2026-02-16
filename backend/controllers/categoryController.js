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
    try{
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
    } catch (error) {
        console.error('Error en getCategories', error);
        res.status(500).json ({
            succes: false,
            message: 'Error al obtener categorias',
            error: error.message
        })
    }    

};

/**
 * READ obtener una categoria por el especificador - id
 * GET /api/categories/
 */

exports.getCategoryById = async (req, res) => {
    try{
        //por defecto solo se muestran las categorias activas
        // IncludeInactive = true permite ver todas las categorias incluyendo las desactivadas
        const Category = await Category.findById(req.params.id);

        if (!Category) {
            return res.status(404).json({
                succes: false,
                message: 'Categoria no encontrada'
            });
        }
        res.status(200).json({
            succes: false,
            data: category
        });
    } catch (error) {
        console.error('Error en getCategoryById', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener categorias',
            error: error.message
        })
    }
};

/**
 * UPDATE Actualizar categoria existente
 * PUT /api/categories/:id
 * Auth Bearer token requerido 
 * Rolos: admin y coordinaria
 * 1 - name: nombre de la categoria 
 * 2 - descripcion: nueva descripcion de la categoria
 * Si quiere solo actualiza el nombre o solo la descripcion o los dos
 * Retorna:
 * 1- 200: Categoria actualizada
 * 2- 400: Validacion de datos fallida o nombre duplicado
 * 3- 404: Categoria no encontrada
 * 4- 500: Erro en la base 
 */

exports.updateCategory = async (reportError, res) => {
    try {

        const {name, descripion} = req.body;
        const updateData = {};

        // solo actualiza campos que fueron enviados

        if (name) {
            updateData.name = name.trim();

            //verificar si el nuevo nombre ya existe en otra categoria
            const existingCategory = await Category.findOne({ name: updateData.name, _id: { $ne: req.params.id}});
            
            // Asegura que el nuevo nombre no sea el mismo id
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe una categoria con ese nombre'
                });
            }
        }
        
        if (description) {
            updateData.descripion = description.trim();  
        }

        // Actualizar la categoria en la base de datos 
        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true});
        
        if (!updateCategory) {
            return res.status(404).json({
                success: false,
                message: 'Categoria no encontrada',
                data: updatedCategory
            });
        }

        res.status(200).json({
            succes: false,
            message: 'Categoria actualizada exitosamente',
            data: updatedCategory
        });
    }catch (error) {
        console.error('Error en updateCategory', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la categoria',
            error: error.message
        });
    }

};

/**
 * DELETE eliminar o desactivar una categoria
 * DELETE /api/categories/:id
 * Auth Bearer token requerido
 * Roles: admin
 * 
 * Query Params:
 * hardDelete: true elimina permanentemente de la base de datos
 * Default: Soft delete (solo desactivar)
 * SOFT DELETE: Marca la categoria como inactiva
 * Desactiva en cascada todas las subcategorias y productos relacionados a la categoria
 * Al activar retorna todos los datos de la categoria incluyendo los inactivos
 * 
 * HARD DELETE: Elimina permanenetemente la categoria de la base de datos
 * Elimina en cascada la categoria, subcategoria y productos relacionados
 * NO SE PUEDE RECUPERAR!
 * 
 * Retorna:
 * 1- 200: Categoria eliminada o desactivada
 * 2- 404: Categoria no encontrada
 * 3- 500: Error en la base de datos    
 */

exports.deleteCategory = async (req, res) => {
    try {
        const Subcategory = require ('../models/Subcategory');
        const Product = require ('../models/Product');
        const isHardDelete = req.query.hardDelete === 'true';

        // Buscar la categoria a eliminar por su id
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoria no encontrada'
            });
        }

        if (isHardDelete) {
            // Eliminar en cascada subcategorias y productos relacionados

            // Paso 1 - Obtener IDs de todas las subcategorias relacionadas a la categoria
            const subIds = (await Subcategory.find({category: req.params.id})).map(s => s._id);

            // Paso 2 - Eliminar todas las subcategorias relacionadas a la categoria
            await Product.deleteMany({ category: req.params.id });

            // Paso 3 - Eliminar todos los productos de la subcategoria relacionados a la categoria
            await Subcategory.deleteMany({ subcategory: {$in: subIds}});

            // Paso 4 - Eliminar todas las subcategorias relacionadas a la categoria
            await Subcategory.deleteMany({ category: req.params.id});

            // Paso 5 - Eliminar la categoria misma
            await Category.findByIdAndDelete(req.params.id);

            res.status(200).json({
                success: true,
                message: 'Categoria eliminada permanentemente y sus subcategorias y productos relacionados',
                data: {
                    category: category
                }
            });

        } else {

            // Soft delete - Solo marca la categoria como inactiva
            category.active = false;
            await category.save();

            // Desactivar todas las subcategorias relacionadas
            const subcategories = await Subcategory.updateMany(
                { category: req.params.id },
                { active: false}
            );

            // Desactivar todos los productos ralacionados por la categoria y subcategoria
            const products = await Product.updateMany(
                { category: req.params.id },
                { active: false}
            );

            res.status(200).json({
                success: true,
                message: 'Categoria desactivada exitosamente como sus subcategorias y productos relacionados',
                data: {
                    category: category,
                    subcategoriesDeactivated: subcategories.modifiedCount,
                    productsDeactivated: products.modifiedCount
                }
            });
        } 
    } catch (error) {
        console.error('Error en deleteCategory', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la categoria',
            error: error.message
        });
    }
};