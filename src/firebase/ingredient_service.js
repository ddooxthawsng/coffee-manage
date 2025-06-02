import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './FirebaseConfigSetup';

// Collection reference
const ingredientsCollection = collection(db, 'ingredients');

// Thêm nguyên liệu mới
export const addIngredient = async (ingredientData) => {
  try {
    const docRef = await addDoc(ingredientsCollection, {
      ...ingredientData,
      inventory: ingredientData.inventory || 0, // Thêm tồn kho
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Thêm nguyên liệu thành công với ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Lỗi khi thêm nguyên liệu: ', error);
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
    console.error('Lỗi khi lấy danh sách nguyên liệu: ', error);
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
    console.error('Lỗi khi cập nhật nguyên liệu: ', error);
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
    console.error('Lỗi khi xóa nguyên liệu: ', error);
    throw error;
  }
};

// Cập nhật tồn kho nguyên liệu
export const updateIngredientInventory = async (ingredientId, quantityUsed) => {
  try {
    // Lấy thông tin nguyên liệu hiện tại
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
    console.error('Lỗi khi cập nhật tồn kho nguyên liệu: ', error);
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
    console.error('Lỗi khi nhập kho nguyên liệu: ', error);
    throw error;
  }
};

// Kiểm tra nguyên liệu sắp hết
export const getLowStockIngredients = async (threshold = 10) => {
  try {
    const ingredients = await getIngredients();
    return ingredients.filter(ing => (ing.inventory || 0) <= threshold);
  } catch (error) {
    console.error('Lỗi khi kiểm tra nguyên liệu sắp hết: ', error);
    throw error;
  }
};