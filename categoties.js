const fs = require('fs');

const fetchCategoriesAndProducts = async () => {
  const categoriesUrl = 'https://api-tiki.vercel.app/categories';
  const productsUrl = 'https://api-tiki.vercel.app/products';

  try {
    // Fetch categories
    const categoriesResponse = await fetch(categoriesUrl);
    const categoriesData = await categoriesResponse.json();

    // Create a category map, skip id = 0
    const categoryMap = categoriesData.reduce((map, category) => {
      const id = parseInt(category.id);
      if (id !== 0) {
        map[id] = {
          id,
          name: category.name,
          icon: category.icon || null,
        };
      }
      return map;
    }, {});

    // Fetch products
    const productsResponse = await fetch(productsUrl);
    const productsData = await productsResponse.json();

    // Extract unique categories from product breadcrumbs
    productsData.forEach((product) => {
      product.breadcrumbs.forEach((breadcrumb) => {
        const catId = parseInt(breadcrumb.category_id);
        if (catId !== 0 && !categoryMap[catId]) {
          categoryMap[catId] = {
            id: catId,
            name: breadcrumb.name,
            icon: null, // No icon in breadcrumbs
          };
        }
      });
    });

    // Convert category map to array
    const uniqueCategories = Object.values(categoryMap);

    // Save to file
    fs.writeFileSync('categories.json', JSON.stringify(uniqueCategories, null, 2));

    console.log('✅ Đã ghi categories.json thành công. Số lượng:', uniqueCategories.length);
    return uniqueCategories;
  } catch (error) {
    console.error('❌ Lỗi khi fetch hoặc ghi file:', error);
  }
};

fetchCategoriesAndProducts();
