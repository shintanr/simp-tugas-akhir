import { 
  getModulesAllByPraktikumId, 
  createModule, 
  updateModule, 
  deleteModule 
} from '../db.js';

export const getModulesByPraktikumId = async (req, res) => {
  try {
    const { prakId } = req.params;
    const modules = await getModulesAllByPraktikumId(prakId);

    res.json({
      message: `List of Module Praktikum Elektronika Dasar ${prakId}`,
      data: modules,
    });
  } catch (error) {
    console.error("Error fetching modules:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Admin methods
export const createNewModule = async (req, res) => {
  try {
    const { judul_modul, id_praktikum } = req.body;
    
    if (!judul_modul || !id_praktikum) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
    }

    const newModule = await createModule({ judul_modul, id_praktikum });
    
    res.status(201).json({
      status: 'success',
      data: newModule,
      message: 'Module created successfully'
    });
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create module',
      error: error.message
    });
  }
};

export const updateExistingModule = async (req, res) => {
  try {
    const moduleId = parseInt(req.params.moduleId);
    const { judul_modul, video_url } = req.body;
    
    if (!judul_modul) {
      return res.status(400).json({
        status: 'error',
        message: 'Module title is required'
      });
    }
    
    const updatedModule = await updateModule(moduleId, {
      judul_modul,
      video_url: video_url || null
    });
    
    if (updatedModule.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Module not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: updatedModule,
      message: 'Module updated successfully'
    });
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update module',
      error: error.message
    });
  }
};

export const deleteExistingModule = async (req, res) => {
  try {
    const moduleId = parseInt(req.params.moduleId);
    const result = await deleteModule(moduleId);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Module not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Module deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete module',
      error: error.message
    });
  }
};