import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { message } from 'antd';
import db from './FirebaseConfigSetup';

// Collection references
const ingredientsCollection = collection(db, 'ingredients');
const processedIngredientsCollection = collection(db, 'processed_ingredients');

// =================== NGUYÊN LIỆU THÔ ===================

// Thêm nguyên liệu mới
export const addIngredient = async (ingredientData) => {
  try {
    const docRef = await addDoc(ingredientsCollection, {
      ...ingredientData,
      inventory: ingredientData.inventory || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Thêm nguyên liệu thành công với ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    message.error('Lỗi khi thêm nguyên liệu: ' + error.message);
    throw error;
  }
};

// Lấy danh sách nguyên liệu
export const getIngredients = async () => {
  try {
    const querySnapshot = await getDocs(ingredientsCollection);
    const ingredients = [];
    querySnapshot.forEach((doc) => {
      ingredients.push({ id: doc.id, ...doc.data() });
    });
    return ingredients;
  } catch (error) {
    message.error('Lỗi khi lấy danh sách nguyên liệu: ' + error.message);
    throw error;
  }
};

// Cập nhật nguyên liệu
export const updateIngredient = async (ingredientId, updatedData) => {
  try {
    const ingredientDoc = doc(db, 'ingredients', ingredientId);
    await updateDoc(ingredientDoc, {
      ...updatedData,
      updatedAt: new Date()
    });
    console.log('Cập nhật nguyên liệu thành công');
  } catch (error) {
    message.error('Lỗi khi cập nhật nguyên liệu: ' + error.message);
    throw error;
  }
};

// Xóa nguyên liệu
export const deleteIngredient = async (ingredientId) => {
  try {
    const ingredientDoc = doc(db, 'ingredients', ingredientId);
    await deleteDoc(ingredientDoc);
    console.log('Xóa nguyên liệu thành công');
  } catch (error) {
    message.error('Lỗi khi xóa nguyên liệu: ' + error.message);
    throw error;
  }
};

// Cập nhật tồn kho nguyên liệu
export const updateIngredientInventory = async (ingredientId, quantityUsed) => {
  try {
    const ingredients = await getIngredients();
    const ingredient = ingredients.find(ing => ing.id === ingredientId);
    if (ingredient) {
      const newInventory = Math.max(0, (ingredient.inventory || 0) - quantityUsed);
      await updateIngredient(ingredientId, {
        inventory: newInventory
      });
      console.log(`Cập nhật tồn kho ${ingredient.name}: ${ingredient.inventory || 0} -> ${newInventory}`);
    }
  } catch (error) {
    message.error('Lỗi khi cập nhật tồn kho nguyên liệu: ' + error.message);
    throw error;
  }
};

// Nhập kho nguyên liệu
export const addIngredientStock = async (ingredientId, quantityAdded) => {
  try {
    const ingredients = await getIngredients();
    const ingredient = ingredients.find(ing => ing.id === ingredientId);
    if (ingredient) {
      const newInventory = (ingredient.inventory || 0) + quantityAdded;
      await updateIngredient(ingredientId, {
        inventory: newInventory
      });
      console.log(`Nhập kho ${ingredient.name}: ${ingredient.inventory || 0} -> ${newInventory}`);
    }
  } catch (error) {
    message.error('Lỗi khi nhập kho nguyên liệu: ' + error.message);
    throw error;
  }
};

// Kiểm tra nguyên liệu sắp hết
export const getLowStockIngredients = async (threshold = 10) => {
  try {
    const ingredients = await getIngredients();
    return ingredients.filter(ing => (ing.inventory || 0) <= threshold);
  } catch (error) {
    message.error('Lỗi khi kiểm tra nguyên liệu sắp hết: ' + error.message);
    throw error;
  }
};

// =================== NGUYÊN LIỆU THÀNH PHẨM ===================

// Thêm nguyên liệu thành phẩm
export const addProcessedIngredient = async (processedData) => {
  try {
    const docRef = await addDoc(processedIngredientsCollection, {
      ...processedData,
      inventory: processedData.inventory || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Thêm nguyên liệu thành phẩm thành công với ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    message.error('Lỗi khi thêm nguyên liệu thành phẩm: ' + error.message);
    throw error;
  }
};

// Lấy danh sách nguyên liệu thành phẩm
export const getProcessedIngredients = async () => {
  try {
    const querySnapshot = await getDocs(processedIngredientsCollection);
    const processedIngredients = [];
    querySnapshot.forEach((doc) => {
      processedIngredients.push({ id: doc.id, ...doc.data() });
    });
    return processedIngredients;
  } catch (error) {
    message.error('Lỗi khi lấy danh sách nguyên liệu thành phẩm: ' + error.message);
    throw error;
  }
};

// Cập nhật nguyên liệu thành phẩm
export const updateProcessedIngredient = async (processedId, updatedData) => {
  try {
    const processedDoc = doc(db, 'processed_ingredients', processedId);
    await updateDoc(processedDoc, {
      ...updatedData,
      updatedAt: new Date()
    });
    console.log('Cập nhật nguyên liệu thành phẩm thành công');
  } catch (error) {
    message.error('Lỗi khi cập nhật nguyên liệu thành phẩm: ' + error.message);
    throw error;
  }
};

// Xóa nguyên liệu thành phẩm
export const deleteProcessedIngredient = async (processedId) => {
  try {
    const processedDoc = doc(db, 'processed_ingredients', processedId);
    await deleteDoc(processedDoc);
    console.log('Xóa nguyên liệu thành phẩm thành công');
  } catch (error) {
    message.error('Lỗi khi xóa nguyên liệu thành phẩm: ' + error.message);
    throw error;
  }
};

// Chế biến nguyên liệu thô thành thành phẩm
export const processRawToProcessed = async (processedId, batchQuantity) => {
  try {
    // Lấy thông tin nguyên liệu thành phẩm
    const processedIngredients = await getProcessedIngredients();
    const processedIngredient = processedIngredients.find(p => p.id === processedId);

    if (!processedIngredient) {
      message.error('Không tìm thấy nguyên liệu thành phẩm');
      throw new Error('Không tìm thấy nguyên liệu thành phẩm');
    }

    // Kiểm tra nguyên liệu thô có đủ không
    const rawIngredients = await getIngredients();
    for (const recipeItem of processedIngredient.recipe) {
      const rawIngredient = rawIngredients.find(r => r.id === recipeItem.id);
      if (!rawIngredient) {
        message.error(`Không tìm thấy nguyên liệu thô: ${recipeItem.name}`);
        throw new Error(`Không tìm thấy nguyên liệu thô: ${recipeItem.name}`);
      }

      const requiredQuantity = recipeItem.quantity * batchQuantity;
      if ((rawIngredient.inventory || 0) < requiredQuantity) {
        message.error(`Không đủ ${recipeItem.name}. Cần: ${requiredQuantity}, Có: ${rawIngredient.inventory || 0}`);
        throw new Error(`Không đủ ${recipeItem.name}. Cần: ${requiredQuantity}, Có: ${rawIngredient.inventory || 0}`);
      }
    }

    // Trừ nguyên liệu thô
    for (const recipeItem of processedIngredient.recipe) {
      const requiredQuantity = recipeItem.quantity * batchQuantity;
      await updateIngredientInventory(recipeItem.id, requiredQuantity);
    }

    // Cộng nguyên liệu thành phẩm
    const producedQuantity = processedIngredient.outputQuantity * batchQuantity;
    const newInventory = (processedIngredient.inventory || 0) + producedQuantity;

    await updateProcessedIngredient(processedId, {
      inventory: newInventory
    });

    console.log(`Chế biến thành công ${batchQuantity} lô ${processedIngredient.name}`);
    message.success(`Chế biến thành công ${batchQuantity} lô ${processedIngredient.name}`);

    return {
      success: true,
      producedQuantity,
      newInventory
    };
  } catch (error) {
    message.error('Lỗi khi chế biến nguyên liệu: ' + error.message);
    throw error;
  }
};

// Cập nhật tồn kho nguyên liệu thành phẩm
export const updateProcessedIngredientInventory = async (processedId, quantityUsed) => {
  try {
    const processedIngredients = await getProcessedIngredients();
    const processed = processedIngredients.find(p => p.id === processedId);
    if (processed) {
      const newInventory = Math.max(0, (processed.inventory || 0) - quantityUsed);
      await updateProcessedIngredient(processedId, {
        inventory: newInventory
      });
      console.log(`Cập nhật tồn kho ${processed.name}: ${processed.inventory || 0} -> ${newInventory}`);
    }
  } catch (error) {
    message.error('Lỗi khi cập nhật tồn kho nguyên liệu thành phẩm: ' + error.message);
    throw error;
  }
};

// Nhập kho nguyên liệu thành phẩm
export const addProcessedIngredientStock = async (processedId, quantityAdded) => {
  try {
    const processedIngredients = await getProcessedIngredients();
    const processed = processedIngredients.find(p => p.id === processedId);
    if (processed) {
      const newInventory = (processed.inventory || 0) + quantityAdded;
      await updateProcessedIngredient(processedId, {
        inventory: newInventory
      });
      console.log(`Nhập kho ${processed.name}: ${processed.inventory || 0} -> ${newInventory}`);
      message.success(`Nhập kho ${processed.name}: ${quantityAdded} ${processed.unit}`);
    }
  } catch (error) {
    message.error('Lỗi khi nhập kho nguyên liệu thành phẩm: ' + error.message);
    throw error;
  }
};

// Kiểm tra nguyên liệu thành phẩm sắp hết
export const getLowStockProcessedIngredients = async (threshold = 10) => {
  try {
    const processedIngredients = await getProcessedIngredients();
    return processedIngredients.filter(ing => (ing.inventory || 0) <= threshold);
  } catch (error) {
    message.error('Lỗi khi kiểm tra nguyên liệu thành phẩm sắp hết: ' + error.message);
    throw error;
  }
};

// Lấy nguyên liệu thành phẩm theo ID
export const getProcessedIngredientById = async (processedId) => {
  try {
    const processedIngredients = await getProcessedIngredients();
    return processedIngredients.find(p => p.id === processedId) || null;
  } catch (error) {
    message.error('Lỗi khi lấy nguyên liệu thành phẩm: ' + error.message);
    throw error;
  }
};

// Lấy nguyên liệu thô theo ID
export const getIngredientById = async (ingredientId) => {
  try {
    const ingredients = await getIngredients();
    return ingredients.find(ing => ing.id === ingredientId) || null;
  } catch (error) {
    message.error('Lỗi khi lấy nguyên liệu: ' + error.message);
    throw error;
  }
};

// Kiểm tra khả năng chế biến (đủ nguyên liệu thô không)
export const checkProcessingAvailability = async (processedId, batchQuantity) => {
  try {
    const processedIngredient = await getProcessedIngredientById(processedId);
    if (!processedIngredient) {
      return { canProcess: false, missingIngredients: [], message: 'Không tìm thấy nguyên liệu thành phẩm' };
    }

    const rawIngredients = await getIngredients();
    const missingIngredients = [];
    let canProcess = true;

    for (const recipeItem of processedIngredient.recipe) {
      const rawIngredient = rawIngredients.find(r => r.id === recipeItem.id);
      const requiredQuantity = recipeItem.quantity * batchQuantity;

      if (!rawIngredient) {
        canProcess = false;
        missingIngredients.push({
          name: recipeItem.name,
          required: requiredQuantity,
          available: 0,
          missing: requiredQuantity
        });
      } else if ((rawIngredient.inventory || 0) < requiredQuantity) {
        canProcess = false;
        missingIngredients.push({
          name: rawIngredient.name,
          required: requiredQuantity,
          available: rawIngredient.inventory || 0,
          missing: requiredQuantity - (rawIngredient.inventory || 0)
        });
      }
    }

    return {
      canProcess,
      missingIngredients,
      message: canProcess ? 'Đủ nguyên liệu để chế biến' : 'Thiếu nguyên liệu'
    };
  } catch (error) {
    message.error('Lỗi khi kiểm tra khả năng chế biến: ' + error.message);
    throw error;
  }
};
