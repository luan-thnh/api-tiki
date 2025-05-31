const fs = require('fs');

const fetchCategoriesAndProducts = async () => {
  const categoriesUrl = 'https://api-tiki.vercel.app/categories';
  const productsUrl = 'https://api-tiki.vercel.app/products';

  try {
    // Fetch categories
    const categoriesResponse = await fetch(categoriesUrl);
    const categoriesData = await categoriesResponse.json();

    // Khởi tạo categoryMap: lưu thông tin và sẽ thêm parent_id sau
    const categoryMap = categoriesData.reduce((map, category) => {
      const id = parseInt(category.id);
      if (id !== 0) {
        map[id] = {
          id,
          name: category.name,
          icon: category.icon || null,
          parent_id: null,
        };
      }
      return map;
    }, {});

    // Fetch products
    const productsResponse = await fetch(productsUrl);
    const productsData = await productsResponse.json();

    // Duyệt qua từng product để phân tích breadcrumbs
    productsData.forEach((product) => {
      const breadcrumbs = product.breadcrumbs;

      for (let i = 0; i < breadcrumbs.length; i++) {
        const current = breadcrumbs[i];
        const currentId = parseInt(current.category_id);
        if (currentId === 0) continue;

        const parent = i > 0 ? breadcrumbs[i - 1] : null;
        const parentId = parent ? parseInt(parent.category_id) : null;

        // Nếu chưa có trong categoryMap thì thêm mới từ breadcrumb
        if (!categoryMap[currentId]) {
          categoryMap[currentId] = {
            id: currentId,
            name: current.name,
            icon: null,
            parent_id: parentId || null,
          };
        }

        // Nếu đã có thì cập nhật parent_id nếu chưa có
        if (parentId && !categoryMap[currentId].parent_id) {
          categoryMap[currentId].parent_id = parentId;
        }
      }
    });

    // Chuyển về array
    const uniqueCategories = Object.values(categoryMap);

    // Ghi ra file
    fs.writeFileSync('categories-with-parent.json', JSON.stringify(uniqueCategories, null, 2));
    console.log('✅ Ghi categories-with-parent.json thành công. Số lượng:', uniqueCategories.length);

    return uniqueCategories;
  } catch (error) {
    console.error('❌ Lỗi khi fetch hoặc ghi file:', error);
  }
};

fetchCategoriesAndProducts();
