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
  Alert
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
  nome: string;
  categoria_id: string;
  categoria_nome: string;
  preco: number;
  descricao: string;
  disponivel: boolean;
  imagem_url?: string;
}

interface Category {
  id: string;
  nome: string;
  descricao?: string;
}

// Interface para o formulário de item
interface ItemFormData {
  nome: string;
  categoria_id: string;
  preco: string;
  descricao: string;
  disponivel: boolean;
  imagem_url: string;
}

// Interface para o formulário de categoria
interface CategoryFormData {
  nome: string;
  descricao: string;
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
  
  // Estado para controle de abas
  const [tabValue, setTabValue] = useState(0);
  
  const notification = useNotification();

  // Form states
  const [itemFormData, setItemFormData] = useState<ItemFormData>({
    nome: "",
    categoria_id: "",
    preco: "",
    descricao: "",
    disponivel: true,
    imagem_url: ""
  });
  
  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({
    nome: "",
    descricao: ""
  });

  // Função para buscar itens e categorias
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar categorias primeiro
      const categoriesData = await ApiService.getCategories();
      setCategories(categoriesData);
      
      // Depois buscar itens
      const itemsData = await ApiService.getMenuItems();
      setMenuItems(itemsData);
      
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
      await ApiService.updateMenuItemAvailability(itemId.toString(), !currentAvailability);
      
      setMenuItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId ? { ...item, disponivel: !currentAvailability } : item
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
        nome: item.nome,
        categoria_id: item.categoria_id,
        preco: item.preco.toString(),
        descricao: item.descricao,
        disponivel: item.disponivel,
        imagem_url: item.imagem_url || ""
      });
    } else {
      setCurrentItem(null);
      setItemFormData({
        nome: "",
        categoria_id: categories.length > 0 ? categories[0].id : "",
        preco: "",
        descricao: "",
        disponivel: true,
        imagem_url: ""
      });
    }
    setOpenItemDialog(true);
  };

  const handleCloseItemDialog = () => {
    setOpenItemDialog(false);
    setImageFile(null);
  };

  const handleItemInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
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
      disponivel: e.target.checked
    }));
  };

  const handleImageUpload = (file: File) => {
    setImageFile(file);
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setItemFormData(prev => ({
      ...prev,
      imagem_url: ""
    }));
  };

  const handleSubmitItem = async () => {
    try {
      setIsUploading(true);
      
      // Validação básica
      if (!itemFormData.nome || !itemFormData.categoria_id || !itemFormData.preco) {
        notification.showError("Preencha todos os campos obrigatórios");
        setIsUploading(false);
        return;
      }

      // Criar FormData para envio com imagem
      const formData = new FormData();
      formData.append("nome", itemFormData.nome);
      formData.append("categoria_id", itemFormData.categoria_id);
      formData.append("preco", itemFormData.preco);
      formData.append("descricao", itemFormData.descricao);
      formData.append("disponivel", itemFormData.disponivel.toString());
      
      if (imageFile) {
        formData.append("imagem", imageFile);
      }

      let response;
      if (currentItem) {
        // Atualizar item existente
        response = await ApiService.updateMenuItem(currentItem.id.toString(), formData);
        notification.showSuccess("Item atualizado com sucesso");
      } else {
        // Adicionar novo item
        response = await ApiService.createMenuItem(formData);
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
        await ApiService.deleteMenuItem(itemId.toString());
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
        nome: category.nome,
        descricao: category.descricao || ""
      });
    } else {
      setCurrentCategory(null);
      setCategoryFormData({
        nome: "",
        descricao: ""
      });
    }
    setOpenCategoryDialog(true);
  };

  const handleCloseCategoryDialog = () => {
    setOpenCategoryDialog(false);
  };

  const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
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
      if (!categoryFormData.nome) {
        notification.showError("O nome da categoria é obrigatório");
        setIsSavingCategory(false);
        return;
      }

      if (currentCategory) {
        // Atualizar categoria existente
        await ApiService.updateCategory(currentCategory.id, {
          nome: categoryFormData.nome,
          descricao: categoryFormData.descricao
        });
        notification.showSuccess("Categoria atualizada com sucesso");
      } else {
        // Adicionar nova categoria
        await ApiService.createCategory({
          nome: categoryFormData.nome,
          descricao: categoryFormData.descricao
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
    const itemsUsingCategory = menuItems.filter(item => item.categoria_id === categoryId);
    
    if (itemsUsingCategory.length > 0) {
      notification.showError(`Não é possível excluir esta categoria. Existem ${itemsUsingCategory.length} itens associados a ela.`);
      return;
    }
    
    if (window.confirm("Tem certeza que deseja excluir esta categoria?")) {
      try {
        await ApiService.deleteCategory(categoryId);
        setCategories(prevCategories => prevCategories.filter(cat => cat.id !== categoryId));
        notification.showSuccess("Categoria removida com sucesso");
      } catch (error) {
        notification.showError("Erro ao remover categoria");
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
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {menuItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body1">Nenhum item cadastrado.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    menuItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.nome}</TableCell>
                        <TableCell>
                          <Chip label={item.categoria_nome} size="small" />
                        </TableCell>
                        <TableCell>R$ {item.preco.toFixed(2)}</TableCell>
                        <TableCell>
                          <Switch
                            checked={item.disponivel}
                            onChange={() => handleToggleAvailability(item.id, item.disponivel)}
                            color="primary"
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
                      const itemCount = menuItems.filter(item => item.categoria_id === category.id).length;
                      
                      return (
                        <TableRow key={category.id}>
                          <TableCell>{category.id}</TableCell>
                          <TableCell>{category.nome}</TableCell>
                          <TableCell>{category.descricao || "-"}</TableCell>
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
                name="nome"
                value={itemFormData.nome}
                onChange={handleItemInputChange}
                margin="normal"
                required
              />
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Categoria</InputLabel>
                <Select
                  name="categoria_id"
                  value={itemFormData.categoria_id}
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
                        {category.nome}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Preço (R$)"
                name="preco"
                value={itemFormData.preco}
                onChange={handleItemInputChange}
                margin="normal"
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                required
              />
              <TextField
                fullWidth
                label="Descrição"
                name="descricao"
                value={itemFormData.descricao}
                onChange={handleItemInputChange}
                margin="normal"
                multiline
                rows={4}
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={itemFormData.disponivel} 
                    onChange={handleItemSwitchChange} 
                    color="primary" 
                  />
                }
                label="Disponível"
                sx={{ mt: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Imagem do Item
              </Typography>
              <ImageUpload
                onImageUpload={handleImageUpload}
                onImageRemove={handleImageRemove}
                previewUrl={itemFormData.imagem_url}
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
            name="nome"
            value={categoryFormData.nome}
            onChange={handleCategoryInputChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Descrição (opcional)"
            name="descricao"
            value={categoryFormData.descricao}
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
    </Box>
  );
};

export default AdminItemManagementPage;
