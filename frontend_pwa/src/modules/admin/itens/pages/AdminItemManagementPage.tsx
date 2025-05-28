// src/modules/admin/itens/pages/AdminItemManagementPage.tsx
import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  Chip,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Alert,
  Checkbox, // NOVO: Checkbox para seleção de categorias de adicionais
  FormGroup, // NOVO: Para agrupar checkboxes
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Category as CategoryIcon
} from "@mui/icons-material";
import ApiService from "../../../shared/services/ApiService";
import { useNotification } from "../../../../contexts/NotificationContext";
import { ImageUpload } from "../../../../components/UI/ImageUpload";

interface MenuItem {
  id: number;
  name: string;
  category_id: string; // Pode ser string se o backend retornar UUIDs, senão number
  category_name: string;
  price: number;
  description: string;
  available: boolean;
  image_url?: string;
  has_addons: boolean;
  addon_categories?: AddonCategory[];
}

interface Category {
  id: string; // Pode ser string se o backend retornar UUIDs, senão number
  name: string;
  description?: string;
}

interface AddonCategory {
  id: string; // Assume string para IDs do backend (UUID ou INT como string)
  name: string;
  min_selections: number;
  max_selections: number;
  is_required: boolean;
  options: AddonOption[];
}

interface AddonOption {
  id: string; // Assume string para IDs do backend
  addon_category_id: string;
  name: string;
  price: number;
}


// Interface para o formulário de item
interface ItemFormData {
  name: string;
  category_id: string;
  price: string;
  description: string;
  available: boolean;
  image_url: string;
  has_addons: boolean;
  addon_category_ids: string[]; // Array de strings para IDs
}

// Interface para o formulário de categoria
interface CategoryFormData {
  name: string;
  description: string;
}

// Interface para o formulário de categoria de adicional
interface AddonCategoryFormData {
  name: string;
  min_selections: number;
  max_selections: number;
  is_required: boolean;
}

// Interface para o formulário de opção de adicional
interface AddonOptionFormData {
  name: string;
  price: string;
}


const AdminItemManagementPage: React.FC = () => {
  // Estados para itens
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Estados para categorias
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Estados para gerenciamento de adicionais
  const [addonCategories, setAddonCategories] = useState<AddonCategory[]>([]);
  const [openAddonCategoryDialog, setOpenAddonCategoryDialog] = useState(false);
  const [currentAddonCategory, setCurrentAddonCategory] = useState<AddonCategory | null>(null);
  const [isSavingAddonCategory, setIsSavingAddonCategory] = useState(false);
  const [openAddonOptionDialog, setOpenAddonOptionDialog] = useState(false);
  const [currentAddonOption, setCurrentAddonOption] = useState<AddonOption | null>(null);
  const [isSavingAddonOption, setIsSavingAddonOption] = useState(false);
  const [selectedAddonCategoryIdForOption, setSelectedAddonCategoryIdForOption] = useState<string | null>(null);


  // Estado para controle de abas
  const [tabValue, setTabValue] = useState(0);

  const notification = useNotification();

  // Form states
  const [itemFormData, setItemFormData] = useState<ItemFormData>({
    name: "",
    category_id: "",
    price: "",
    description: "",
    available: true,
    image_url: "",
    has_addons: false,
    addon_category_ids: [],
  });

  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({
    name: "",
    description: ""
  });

  // Form states para adicionais
  const [addonCategoryFormData, setAddonCategoryFormData] = useState<AddonCategoryFormData>({
    name: "",
    min_selections: 0,
    max_selections: 0,
    is_required: false,
  });

  const [addonOptionFormData, setAddonOptionFormData] = useState<AddonOptionFormData>({
    name: "",
    price: ""
  });

  // Função para buscar itens, categorias e categorias de adicionais
  const fetchData = async () => {
    try {
      setLoading(true);

      // Buscar categorias
      const categoriesData = await ApiService.getCategories();
      // Garanta que os IDs das categorias sejam strings se o backend pode retornar numbers
      setCategories(categoriesData.map((cat: any) => ({ ...cat, id: String(cat.id) })));

      // Buscar categorias de adicionais
      const addonCategoriesData = await ApiService.getAddonCategories();
      setAddonCategories(addonCategoriesData.map((cat: any) => ({
        ...cat,
        id: String(cat.id),
        options: cat.options.map((opt: any) => ({ ...opt, id: String(opt.id), addon_category_id: String(opt.addon_category_id) }))
      })));

      // Depois buscar itens
      const itemsData = await ApiService.getMenuItems();
      setMenuItems(itemsData.map((item: any) => ({
        ...item,
        id: String(item.id), // Garanta que o ID do item seja string
        category_id: String(item.category_id), // Garanta que o category_id do item seja string
        addon_categories: item.addon_categories ? item.addon_categories.map((ac: any) => ({ ...ac, id: String(ac.id) })) : []
      })));

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao buscar dados.");
      notification.showError("Erro ao carregar dados do cardápio");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Funções para gerenciamento de itens
  const handleToggleAvailability = async (itemId: number, currentAvailability: boolean) => {
    try {
      // Importante: garantir que itemId seja string para a API
      await ApiService.updateMenuItemAvailability(String(itemId), !currentAvailability);

      setMenuItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, available: !currentAvailability } : item
        )
      );

      notification.showSuccess(`Item ${!currentAvailability ? 'disponibilizado' : 'indisponibilizado'} com sucesso`);
    } catch (error) {
      notification.showError("Erro ao atualizar disponibilidade do item");
    }
  };

  const handleOpenItemDialog = (item?: MenuItem) => {
    if (item) {
      setCurrentItem(item);
      setItemFormData({
        name: item.name,
        category_id: item.category_id,
        price: item.price.toString(),
        description: item.description,
        available: item.available,
        image_url: item.image_url || "",
        has_addons: item.has_addons,
        // Ao abrir para edição, converta os IDs para string, se necessário
        addon_category_ids: item.addon_categories?.map(ac => String(ac.id)) || [],
      });
    } else {
      setCurrentItem(null);
      setItemFormData({
        name: "",
        // Garanta que o ID da categoria padrão seja string
        category_id: categories.length > 0 ? String(categories[0].id) : "",
        price: "",
        description: "",
        available: true,
        image_url: "",
        has_addons: false,
        addon_category_ids: [],
      });
    }
    setOpenItemDialog(true);
  };

  const handleCloseItemDialog = () => {
    setOpenItemDialog(false);
    setImageFile(null);
  };

  const handleItemInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setItemFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleItemSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setItemFormData(prev => ({
      ...prev,
      available: e.target.checked
    }));
  };

  const handleHasAddonsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setItemFormData(prev => ({
      ...prev,
      has_addons: e.target.checked,
      addon_category_ids: e.target.checked ? prev.addon_category_ids : []
    }));
  };

  const handleAddonCategorySelectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const categoryIdAsString = String(value); // Garante que o ID do checkbox é uma string

    setItemFormData(prev => {
      let newAddonCategoryIds: string[];

      if (checked) {
        // Adiciona apenas se o ID (como string) não estiver já presente
        if (!prev.addon_category_ids.includes(categoryIdAsString)) {
          newAddonCategoryIds = [...prev.addon_category_ids, categoryIdAsString];
        } else {
          newAddonCategoryIds = [...prev.addon_category_ids]; // Já existe, não faz nada
        }
      } else {
        // Remove todas as ocorrências do ID (como string)
        newAddonCategoryIds = prev.addon_category_ids.filter(id => id !== categoryIdAsString);
      }

      console.log("Checkbox clicado:", { value, checked, currentIds: prev.addon_category_ids, newIds: newAddonCategoryIds });
      return {
        ...prev,
        addon_category_ids: newAddonCategoryIds
      };
    });
  };

  const handleImageUpload = (file: File) => {
    setImageFile(file);
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setItemFormData(prev => ({
      ...prev,
      image_url: ""
    }));
  };

  const handleSubmitItem = async () => {
    try {
      setIsUploading(true);

      // Validação básica
      if (!itemFormData.name || !itemFormData.category_id || !itemFormData.price) {
        notification.showError("Preencha todos os campos obrigatórios");
        setIsUploading(false);
        return;
      }
      if (itemFormData.has_addons && itemFormData.addon_category_ids.length === 0) {
        notification.showError("Se o item possui adicionais, selecione ao menos uma categoria de adicional.");
        setIsUploading(false);
        return;
      }


      // Criar FormData para envio com image
      const formData = new FormData();
      formData.append("name", itemFormData.name);
      formData.append("category_id", itemFormData.category_id); // Já é string
      formData.append("price", itemFormData.price);
      formData.append("description", itemFormData.description);
      formData.append("available", itemFormData.available.toString());
      formData.append("has_addons", itemFormData.has_addons.toString());

      if (itemFormData.has_addons) {
        itemFormData.addon_category_ids.forEach(id => {
          formData.append("addon_category_ids[]", id); // IDs já são strings
        });
      }

      if (imageFile) {
        formData.append("image", imageFile);
      }

      let response;
      if (currentItem) {
        // Atualizar item existente
        await ApiService.updateMenuItem(String(currentItem.id), formData); // Garante que currentItem.id é string
        notification.showSuccess("Item atualizado com sucesso");
      } else {
        // Adicionar novo item
        await ApiService.createMenuItem(formData);
        notification.showSuccess("Item adicionado com sucesso");
      }

      // Atualizar a lista de itens
      fetchData();

      // Fechar o diálogo e limpar o estado
      handleCloseItemDialog();
    } catch (error) {
      notification.showError("Erro ao salvar item");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (window.confirm("Tem certeza que deseja excluir este item?")) {
      try {
        await ApiService.deleteMenuItem(String(itemId)); // Garante que itemId é string
        setMenuItems(prevItems => prevItems.filter(item => item.id !== itemId));
        notification.showSuccess("Item removido com sucesso");
      } catch (error) {
        notification.showError("Erro ao remover item");
      }
    }
  };

  // Funções para gerenciamento de categorias
  const handleOpenCategoryDialog = (category?: Category) => {
    if (category) {
      setCurrentCategory(category);
      setCategoryFormData({
        name: category.name,
        description: category.description || ""
      });
    } else {
      setCurrentCategory(null);
      setCategoryFormData({
        name: "",
        description: ""
      });
    }
    setOpenCategoryDialog(true);
  };

  const handleCloseCategoryDialog = () => {
    setOpenCategoryDialog(false);
  };

  const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setCategoryFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmitCategory = async () => {
    try {
      setIsSavingCategory(true);

      // Validação básica
      if (!categoryFormData.name) {
        notification.showError("O nome da categoria é obrigatório");
        setIsSavingCategory(false);
        return;
      }

      if (currentCategory) {
        // Atualizar categoria existente
        await ApiService.updateCategory(String(currentCategory.id), { // Garante que ID é string
          name: categoryFormData.name,
          description: categoryFormData.description
        });
        notification.showSuccess("Categoria atualizada com sucesso");
      } else {
        // Adicionar nova categoria
        await ApiService.createCategory({
          name: categoryFormData.name,
          description: categoryFormData.description
        });
        notification.showSuccess("Categoria adicionada com sucesso");
      }

      // Atualizar a lista de categorias
      fetchData();

      // Fechar o diálogo e limpar o estado
      handleCloseCategoryDialog();
    } catch (error) {
      notification.showError("Erro ao salvar categoria");
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    // Verificar se há itens usando esta categoria
    const itemsUsingCategory = menuItems.filter(item => item.category_id === categoryId);

    if (itemsUsingCategory.length > 0) {
      notification.showError(`Não é possível excluir esta categoria. Existem ${itemsUsingCategory.length} itens associados a ela.`);
      return;
    }

    if (window.confirm("Tem certeza que deseja excluir esta categoria?")) {
      try {
        await ApiService.deleteCategory(String(categoryId)); // Garante que categoryId é string
        setCategories(prevCategories => prevCategories.filter(cat => cat.id !== categoryId));
        notification.showSuccess("Categoria removida com sucesso");
      } catch (error) {
        notification.showError("Erro ao remover categoria");
      }
    }
  };

  // Funções para gerenciamento de Categorias de Adicionais (NOVO)
  const handleOpenAddonCategoryDialog = (cat?: AddonCategory) => {
    if (cat) {
      setCurrentAddonCategory(cat);
      setAddonCategoryFormData({
        name: cat.name,
        min_selections: cat.min_selections,
        max_selections: cat.max_selections,
        is_required: cat.is_required,
      });
    } else {
      setCurrentAddonCategory(null);
      setAddonCategoryFormData({
        name: "",
        min_selections: 0,
        max_selections: 0,
        is_required: false,
      });
    }
    setOpenAddonCategoryDialog(true);
  };

  const handleCloseAddonCategoryDialog = () => {
    setOpenAddonCategoryDialog(false);
  };

  const handleAddonCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setAddonCategoryFormData(prev => ({
        ...prev,
        [name]: name === "min_selections" || name === "max_selections" ? parseInt(value as string) : value
      }));
    }
  };

  const handleAddonCategorySwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddonCategoryFormData(prev => ({
      ...prev,
      is_required: e.target.checked
    }));
  };

  const handleSubmitAddonCategory = async () => {
    try {
      setIsSavingAddonCategory(true);
      if (!addonCategoryFormData.name) {
        notification.showError("O nome da categoria de adicional é obrigatório.");
        setIsSavingAddonCategory(false);
        return;
      }

      if (currentAddonCategory) {
        await ApiService.updateAddonCategory(String(currentAddonCategory.id), addonCategoryFormData); // Garante que ID é string
        notification.showSuccess("Categoria de adicional atualizada com sucesso!");
      } else {
        await ApiService.createAddonCategory(addonCategoryFormData);
        notification.showSuccess("Categoria de adicional adicionada com sucesso!");
      }
      fetchData(); // Recarregar todos os dados
      handleCloseAddonCategoryDialog();
    } catch (error) {
      notification.showError("Erro ao salvar categoria de adicional.");
    } finally {
      setIsSavingAddonCategory(false);
    }
  };

  const handleDeleteAddonCategory = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta categoria de adicional? Isso também a removerá de quaisquer itens associados.")) {
      try {
        await ApiService.deleteAddonCategory(String(id)); // Garante que ID é string
        fetchData();
        notification.showSuccess("Categoria de adicional removida com sucesso!");
      } catch (error) {
        notification.showError("Erro ao remover categoria de adicional. Verifique se não há itens associados a ela ou opções de adicional.");
      }
    }
  };

  // Funções para gerenciamento de Opções de Adicionais (NOVO)
  const handleOpenAddonOptionDialog = (addonCategoryId: string, option?: AddonOption) => {
    setSelectedAddonCategoryIdForOption(String(addonCategoryId)); // Garante que é string
    if (option) {
      setCurrentAddonOption(option);
      setAddonOptionFormData({
        name: option.name,
        price: option.price.toString()
      });
    } else {
      setCurrentAddonOption(null);
      setAddonOptionFormData({
        name: "",
        price: ""
      });
    }
    setOpenAddonOptionDialog(true);
  };

  const handleCloseAddonOptionDialog = () => {
    setOpenAddonOptionDialog(false);
    setSelectedAddonCategoryIdForOption(null);
  };

  const handleAddonOptionInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setAddonOptionFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmitAddonOption = async () => {
    if (!selectedAddonCategoryIdForOption) {
      notification.showError("ID da categoria de adicional não especificado.");
      return;
    }
    try {
      setIsSavingAddonOption(true);
      if (!addonOptionFormData.name || !addonOptionFormData.price) {
        notification.showError("Preencha todos os campos da opção de adicional.");
        setIsSavingAddonOption(false);
        return;
      }
      const price = parseFloat(addonOptionFormData.price);
      if (isNaN(price) || price < 0) {
        notification.showError("Preço inválido para a opção de adicional.");
        setIsSavingAddonOption(false);
        return;
      }

      if (currentAddonOption) {
        await ApiService.updateAddonOption(String(currentAddonOption.id), { // Garante que ID é string
          name: addonOptionFormData.name,
          price: price
        });
        notification.showSuccess("Opção de adicional atualizada com sucesso!");
      } else {
        await ApiService.createAddonOption(selectedAddonCategoryIdForOption, {
          name: addonOptionFormData.name,
          price: price
        });
        notification.showSuccess("Opção de adicional adicionada com sucesso!");
      }
      fetchData(); // Recarregar todos os dados
      handleCloseAddonOptionDialog();
    } catch (error) {
      notification.showError("Erro ao salvar opção de adicional.");
    } finally {
      setIsSavingAddonOption(false);
    }
  };

  const handleDeleteAddonOption = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta opção de adicional?")) {
      try {
        await ApiService.deleteAddonOption(String(id)); // Garante que ID é string
        fetchData();
        notification.showSuccess("Opção de adicional removida com sucesso!");
      } catch (error) {
        notification.showError("Erro ao remover opção de adicional.");
      }
    }
  };


  // Função para alternar entre abas
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Renderização condicional para loading e erro
  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Carregando dados...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Erro: {error}
        </Alert>
        <Button variant="contained" onClick={fetchData}>
          Tentar novamente
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Gerenciamento do Cardápio</Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="gerenciamento de cardápio">
          <Tab label="Itens" id="tab-0" />
          <Tab label="Categorias" id="tab-1" />
          <Tab label="Adicionais" id="tab-2" /> {/* NOVA ABA */}
        </Tabs>
      </Box>

      {/* Aba de Itens */}
      <div role="tabpanel" hidden={tabValue !== 0}>
        {tabValue === 0 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenItemDialog()}
              >
                Adicionar Novo Item
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Nome</TableCell>
                    <TableCell>Categoria</TableCell>
                    <TableCell>Preço</TableCell>
                    <TableCell>Disponível</TableCell>
                    <TableCell>Adicionais</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {menuItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body1">Nenhum item cadastrado.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    menuItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          <Chip label={item.category_name} size="small" />
                        </TableCell>
                        <TableCell>R$ {item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Switch
                            checked={item.available}
                            onChange={() => handleToggleAvailability(item.id, item.available)}
                            color="primary"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.has_addons ? "Sim" : "Não"}
                            color={item.has_addons ? "info" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenItemDialog(item)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteItem(item.id)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </div>

      {/* Aba de Categorias */}
      <div role="tabpanel" hidden={tabValue !== 1}>
        {tabValue === 1 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenCategoryDialog()}
              >
                Adicionar Nova Categoria
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Nome</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Itens</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body1">Nenhuma categoria cadastrada.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category) => {
                      const itemCount = menuItems.filter(item => item.category_id === category.id).length;

                      return (
                        <TableRow key={category.id}>
                          <TableCell>{category.id}</TableCell>
                          <TableCell>{category.name}</TableCell>
                          <TableCell>{category.description || "-"}</TableCell>
                          <TableCell>
                            <Chip
                              label={`${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`}
                              size="small"
                              color={itemCount > 0 ? "primary" : "default"}
                              variant={itemCount > 0 ? "filled" : "outlined"}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              color="primary"
                              onClick={() => handleOpenCategoryDialog(category)}
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteCategory(category.id)}
                              size="small"
                              disabled={itemCount > 0}
                              title={itemCount > 0 ? "Não é possível excluir categorias com itens associados" : "Excluir categoria"}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </div>

      {/* Aba de Adicionais (NOVA) */}
      <div role="tabpanel" hidden={tabValue !== 2}>
        {tabValue === 2 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenAddonCategoryDialog()}
              >
                Adicionar Nova Categoria de Adicional
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Nome da Categoria</TableCell>
                    <TableCell>Mín. Seleções</TableCell>
                    <TableCell>Máx. Seleções</TableCell>
                    <TableCell>Obrigatório</TableCell>
                    <TableCell>Opções</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {addonCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body1">Nenhuma categoria de adicional cadastrada.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    addonCategories.map((cat) => (
                      <TableRow key={cat.id}>
                        <TableCell>{cat.id}</TableCell>
                        <TableCell>{cat.name}</TableCell>
                        <TableCell>{cat.min_selections}</TableCell>
                        <TableCell>{cat.max_selections}</TableCell>
                        <TableCell>
                          <Chip label={cat.is_required ? "Sim" : "Não"} color={cat.is_required ? "secondary" : "default"} size="small" />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {cat.options.length > 0 ? (
                              cat.options.map(opt => (
                                <Box key={opt.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #eee', borderRadius: '4px', p: 0.5 }}>
                                  <Typography variant="body2">{opt.name} (R$ {opt.price.toFixed(2)})</Typography>
                                  <IconButton size="small" color="error" onClick={() => handleDeleteAddonOption(opt.id)}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              ))
                            ) : (
                              <Typography variant="body2" color="text.secondary">Nenhuma opção</Typography>
                            )}
                            <Button size="small" startIcon={<AddIcon />} onClick={() => handleOpenAddonOptionDialog(cat.id)}>
                              Adicionar Opção
                            </Button>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenAddonCategoryDialog(cat)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteAddonCategory(cat.id)}
                            size="small"
                            disabled={cat.options.length > 0 || menuItems.some(item => item.addon_categories?.some(ac => ac.id === cat.id))}
                            title={cat.options.length > 0 || menuItems.some(item => item.addon_categories?.some(ac => ac.id === cat.id)) ? "Não é possível excluir categorias de adicional com opções ou itens associados" : "Excluir categoria de adicional"}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </div>


      {/* Dialog para adicionar/editar item */}
      <Dialog
        open={openItemDialog}
        onClose={handleCloseItemDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {currentItem ? "Editar Item" : "Adicionar Novo Item"}
          <IconButton onClick={handleCloseItemDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome do Item"
                name="name"
                value={itemFormData.name}
                onChange={handleItemInputChange}
                margin="normal"
                required
              />
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Categoria</InputLabel>
                <Select
                  name="category_id"
                  value={itemFormData.category_id}
                  onChange={handleItemInputChange}
                  label="Categoria"
                >
                  {categories.length === 0 ? (
                    <MenuItem value="" disabled>
                      Nenhuma categoria disponível
                    </MenuItem>
                  ) : (
                    categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Preço (R$)"
                name="price"
                value={itemFormData.price}
                onChange={handleItemInputChange}
                margin="normal"
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                required
              />
              <TextField
                fullWidth
                label="Descrição"
                name="description"
                value={itemFormData.description}
                onChange={handleItemInputChange}
                margin="normal"
                multiline
                rows={4}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={itemFormData.available}
                    onChange={handleItemSwitchChange}
                    color="primary"
                  />
                }
                label="Disponível"
                sx={{ mt: 2 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={itemFormData.has_addons}
                    onChange={handleHasAddonsChange}
                    color="primary"
                  />
                }
                label="Possui Adicionais"
                sx={{ mt: 2 }}
              />

              {itemFormData.has_addons && (
                <Box sx={{ mt: 2, border: '1px solid #ccc', borderRadius: 1, p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Categorias de Adicionais para este Item:
                  </Typography>
                  <FormGroup>
                    {addonCategories.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        Nenhuma categoria de adicional cadastrada. Crie uma na aba "Adicionais".
                      </Typography>
                    ) : (
                      addonCategories.map(cat => (
                        <FormControlLabel
                          key={cat.id} // Certifique-se que cat.id é único e estável
                          control={
                            <Checkbox
                              // Force a comparação de strings para garantir que .includes funcione
                              checked={itemFormData.addon_category_ids.includes(String(cat.id))}
                              onChange={handleAddonCategorySelectionChange}
                              // Garanta que o valor do checkbox é uma string
                              value={String(cat.id)}
                            />
                          }
                          label={cat.name}
                        />
                      ))
                    )}
                  </FormGroup>
                </Box>
              )}


            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Imagem do Item
              </Typography>
              <ImageUpload
                onImageUpload={handleImageUpload}
                onImageRemove={handleImageRemove}
                previewUrl={itemFormData.image_url}
                isUploading={isUploading}
              />
              <Typography variant="body2" color="text.secondary">
                Adicione uma imagem atraente do seu produto para melhorar as vendas.
                Recomendamos imagens com fundo claro e boa iluminação.
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseItemDialog} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitItem}
            variant="contained"
            color="primary"
            disabled={isUploading}
          >
            {isUploading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para adicionar/editar categoria */}
      <Dialog
        open={openCategoryDialog}
        onClose={handleCloseCategoryDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {currentCategory ? "Editar Categoria" : "Adicionar Nova Categoria"}
          <IconButton onClick={handleCloseCategoryDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Nome da Categoria"
            name="name"
            value={categoryFormData.name}
            onChange={handleCategoryInputChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Descrição (opcional)"
            name="description"
            value={categoryFormData.description}
            onChange={handleCategoryInputChange}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCategoryDialog} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitCategory}
            variant="contained"
            color="primary"
            disabled={isSavingCategory}
          >
            {isSavingCategory ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para adicionar/editar Categoria de Adicional (NOVO) */}
      <Dialog
        open={openAddonCategoryDialog}
        onClose={handleCloseAddonCategoryDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {currentAddonCategory ? "Editar Categoria de Adicional" : "Adicionar Nova Categoria de Adicional"}
          <IconButton onClick={handleCloseAddonCategoryDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Nome da Categoria de Adicional"
            name="name"
            value={addonCategoryFormData.name}
            onChange={handleAddonCategoryInputChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Mínimo de Seleções"
            name="min_selections"
            value={addonCategoryFormData.min_selections}
            onChange={handleAddonCategoryInputChange}
            margin="normal"
            type="number"
            inputProps={{ min: 0 }}
          />
          <TextField
            fullWidth
            label="Máximo de Seleções"
            name="max_selections"
            value={addonCategoryFormData.max_selections}
            onChange={handleAddonCategoryInputChange}
            margin="normal"
            type="number"
            inputProps={{ min: 0 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={addonCategoryFormData.is_required}
                onChange={handleAddonCategorySwitchChange}
                color="primary"
              />
            }
            label="Seleção Obrigatória"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddonCategoryDialog} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitAddonCategory}
            variant="contained"
            color="primary"
            disabled={isSavingAddonCategory}
          >
            {isSavingAddonCategory ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para adicionar/editar Opção de Adicional (NOVO) */}
      <Dialog
        open={openAddonOptionDialog}
        onClose={handleCloseAddonOptionDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {currentAddonOption ? "Editar Opção de Adicional" : "Adicionar Nova Opção de Adicional"}
          <IconButton onClick={handleCloseAddonOptionDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Nome da Opção"
            name="name"
            value={addonOptionFormData.name}
            onChange={handleAddonOptionInputChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Preço (R$)"
            name="price"
            value={addonOptionFormData.price}
            onChange={handleAddonOptionInputChange}
            margin="normal"
            type="number"
            inputProps={{ min: 0, step: 0.01 }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddonOptionDialog} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitAddonOption}
            variant="contained"
            color="primary"
            disabled={isSavingAddonOption}
          >
            {isSavingAddonOption ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminItemManagementPage;