// frontend_pwa/src/modules/admin/itens/pages/AdminItemManagementPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent,
  Chip, Tabs, Tab, TextField, InputAdornment
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import api from '../../../../api/api';
import { useLoading } from '../../../../hooks/useLoading';
import { useNotification } from '../../../../contexts/NotificationContext';
import MenuItemForm from '../components/MenuItemForm';
import CategoryForm from '../components/CategoryForm'; // Novo componente de formulário de categoria
import AddonCategoryForm from '../components/AddonCategoryForm'; // Novo componente de formulário de categoria de adicional
import AddonOptionForm from '../components/AddonOptionForm'; // Novo componente de formulário de opção de adicional
import ConfirmationDialog from '../../../../components/ui/ConfirmationDialog';
import { type MenuItem, type Category, type AddonCategory, type AddonOption } from '../../../../types';

const AdminItemManagementPage: React.FC = () => {
  const notification = useNotification();

  // Hooks para carregar dados
  const { data: menuItems, loading: loadingItems, error: itemsError, execute: fetchMenuItems, setData: setMenuItemsManually } = useLoading<MenuItem[]>();
  const { data: categories, loading: loadingCategories, error: categoriesError, execute: fetchCategories, setData: setCategoriesManually } = useLoading<Category[]>();
  const { data: addonCategories, loading: loadingAddons, error: addonsError, execute: fetchAddonCategories, setData: setAddonCategoriesManually } = useLoading<AddonCategory[]>();

  // Estados para modais e formulários
  const [currentTab, setCurrentTab] = useState(0); // 0: Itens, 1: Categorias, 2: Adicionais
  const [isMenuItemFormModalOpen, setIsMenuItemFormModalOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [isCategoryFormModalOpen, setIsCategoryFormModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isAddonCategoryFormModalOpen, setIsAddonCategoryFormModalOpen] = useState(false);
  const [selectedAddonCategory, setSelectedAddonCategory] = useState<AddonCategory | null>(null);
  const [isAddonOptionFormModalOpen, setIsAddonOptionFormModalOpen] = useState(false);
  const [selectedAddonOption, setSelectedAddonOption] = useState<AddonOption | null>(null);
  const [currentAddonCategoryForOption, setCurrentAddonCategoryForOption] = useState<AddonCategory | null>(null); // Para gerenciar opções
  
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'menuItem' | 'category' | 'addonCategory' | 'addonOption', id: string } | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    await fetchMenuItems(api.getMenuItems(), undefined, "Erro ao carregar itens do menu.");
    await fetchCategories(api.getCategories(), undefined, "Erro ao carregar categorias.");
    await fetchAddonCategories(api.getAddonCategories(), undefined, "Erro ao carregar categorias de adicionais.");
  };

  // Funções de Gerenciamento de Itens do Menu
  const handleAddMenuItem = () => {
    setSelectedMenuItem(null);
    setIsMenuItemFormModalOpen(true);
  };

  const handleEditMenuItem = (item: MenuItem) => {
    setSelectedMenuItem(item);
    setIsMenuItemFormModalOpen(true);
  };

  const handleDeleteMenuItem = (id: string) => {
    setItemToDelete({ type: 'menuItem', id });
    setIsConfirmDeleteModalOpen(true);
  };

  const handleSaveMenuItem = async (formData: FormData) => {
    try {
      let savedItem: MenuItem;
      if (selectedMenuItem) {
        savedItem = await api.updateMenuItem(selectedMenuItem.id.toString(), formData);
        notification.showSuccess("Item do menu atualizado com sucesso!");
        setMenuItemsManually(prev => prev ? prev.map(item => (item.id === savedItem.id ? savedItem : item)) : [savedItem]);
      } else {
        savedItem = await api.createMenuItem(formData);
        notification.showSuccess("Item do menu adicionado com sucesso!");
        setMenuItemsManually(prev => prev ? [...prev, savedItem] : [savedItem]);
      }
      setIsMenuItemFormModalOpen(false);
    } catch (err: any) {
      notification.showError(err.message || "Falha ao salvar item do menu.");
    }
  };

  const handleUpdateItemAvailability = async (itemId: string, available: boolean) => {
    try {
      const updatedItem = await api.updateMenuItemAvailability(itemId, available);
      notification.showSuccess(`Item "${updatedItem.name}" ${available ? 'disponibilizado' : 'indisponibilizado'} com sucesso!`);
      setMenuItemsManually(prev => prev ? prev.map(item => (item.id === updatedItem.id ? updatedItem : item)) : []);
    } catch (err: any) {
      notification.showError(err.message || "Erro ao atualizar disponibilidade do item.");
    }
  };

  // Funções de Gerenciamento de Categorias
  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsCategoryFormModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsCategoryFormModalOpen(true);
  };

  const handleDeleteCategory = (id: string) => {
    setItemToDelete({ type: 'category', id });
    setIsConfirmDeleteModalOpen(true);
  };

  const handleSaveCategory = async (data: { name: string; description?: string }) => {
    try {
      let savedCategory: Category;
      if (selectedCategory) {
        savedCategory = await api.updateCategory(selectedCategory.id.toString(), data);
        notification.showSuccess("Categoria atualizada com sucesso!");
        setCategoriesManually(prev => prev ? prev.map(cat => (cat.id === savedCategory.id ? savedCategory : cat)) : [savedCategory]);
      } else {
        savedCategory = await api.createCategory(data);
        notification.showSuccess("Categoria adicionada com sucesso!");
        setCategoriesManually(prev => prev ? [...prev, savedCategory] : [savedCategory]);
      }
      setIsCategoryFormModalOpen(false);
    } catch (err: any) {
      notification.showError(err.message || "Falha ao salvar categoria.");
    }
  };

  // Funções de Gerenciamento de Categorias de Adicionais
  const handleAddAddonCategory = () => {
    setSelectedAddonCategory(null);
    setIsAddonCategoryFormModalOpen(true);
  };

  const handleEditAddonCategory = (cat: AddonCategory) => {
    setSelectedAddonCategory(cat);
    setIsAddonCategoryFormModalOpen(true);
  };

  const handleDeleteAddonCategory = (id: string) => {
    setItemToDelete({ type: 'addonCategory', id });
    setIsConfirmDeleteModalOpen(true);
  };

  const handleSaveAddonCategory = async (data: { name: string; min_selections?: number; max_selections?: number; is_required?: boolean }) => {
    try {
      let savedAddonCategory: AddonCategory;
      if (selectedAddonCategory) {
        savedAddonCategory = await api.updateAddonCategory(selectedAddonCategory.id.toString(), data);
        notification.showSuccess("Categoria de adicional atualizada com sucesso!");
        setAddonCategoriesManually(prev => prev ? prev.map(cat => (cat.id === savedAddonCategory.id ? savedAddonCategory : cat)) : [savedAddonCategory]);
      } else {
        savedAddonCategory = await api.createAddonCategory(data);
        notification.showSuccess("Categoria de adicional adicionada com sucesso!");
        setAddonCategoriesManually(prev => prev ? [...prev, savedAddonCategory] : [savedAddonCategory]);
      }
      setIsAddonCategoryFormModalOpen(false);
    } catch (err: any) {
      notification.showError(err.message || "Falha ao salvar categoria de adicional.");
    }
  };

  // Funções de Gerenciamento de Opções de Adicionais
  const handleAddAddonOption = (addonCategory: AddonCategory) => {
    setCurrentAddonCategoryForOption(addonCategory);
    setSelectedAddonOption(null);
    setIsAddonOptionFormModalOpen(true);
  };

  const handleEditAddonOption = (option: AddonOption, addonCategory: AddonCategory) => {
    setCurrentAddonCategoryForOption(addonCategory);
    setSelectedAddonOption(option);
    setIsAddonOptionFormModalOpen(true);
  };

  const handleDeleteAddonOption = (id: string) => {
    setItemToDelete({ type: 'addonOption', id });
    setIsConfirmDeleteModalOpen(true);
  };

  const handleSaveAddonOption = async (data: { name: string; price: number }) => {
    if (!currentAddonCategoryForOption) return; // Não deve acontecer se o fluxo estiver correto

    try {
      let savedOption: AddonOption;
      if (selectedAddonOption) {
        savedOption = await api.updateAddonOption(selectedAddonOption.id.toString(), data);
        notification.showSuccess("Opção de adicional atualizada com sucesso!");
      } else {
        savedOption = await api.createAddonOption(currentAddonCategoryForOption.id.toString(), data);
        notification.showSuccess("Opção de adicional adicionada com sucesso!");
      }
      // Re-fetch all addon categories to ensure data consistency
      await fetchAddonCategories(api.getAddonCategories(), undefined, "Erro ao recarregar categorias de adicionais após alteração.");
      setIsAddonOptionFormModalOpen(false);
    } catch (err: any) {
      notification.showError(err.message || "Falha ao salvar opção de adicional.");
    }
  };


  // Confirmação de exclusão genérica
  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      switch (itemToDelete.type) {
        case 'menuItem':
          await api.deleteMenuItem(itemToDelete.id);
          notification.showSuccess("Item do menu removido com sucesso!");
          setMenuItemsManually(prev => prev ? prev.filter(item => item.id !== itemToDelete.id) : []);
          break;
        case 'category':
          await api.deleteCategory(itemToDelete.id);
          notification.showSuccess("Categoria removida com sucesso!");
          setCategoriesManually(prev => prev ? prev.filter(cat => cat.id !== itemToDelete.id) : []);
          break;
        case 'addonCategory':
          await api.deleteAddonCategory(itemToDelete.id);
          notification.showSuccess("Categoria de adicional removida com sucesso!");
          setAddonCategoriesManually(prev => prev ? prev.filter(cat => cat.id !== itemToDelete.id) : []);
          break;
        case 'addonOption':
          await api.deleteAddonOption(itemToDelete.id);
          notification.showSuccess("Opção de adicional removida com sucesso!");
          // Após deletar uma opção, você precisa recarregar a categoria de adicionais para atualizar a lista de opções
          await fetchAddonCategories(api.getAddonCategories(), undefined, "Erro ao recarregar categorias de adicionais após exclusão.");
          break;
      }
    } catch (err: any) {
      notification.showError(err.message || `Falha ao remover ${itemToDelete.type}.`);
    } finally {
      setIsConfirmDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };


  const getLoadingMessage = () => {
    if (loadingItems) return "Carregando itens do menu...";
    if (loadingCategories) return "Carregando categorias...";
    if (loadingAddons) return "Carregando adicionais...";
    return "Carregando...";
  };

  const getErrorMessage = () => {
    if (itemsError) return `Erro ao carregar itens: ${itemsError}`;
    if (categoriesError) return `Erro ao carregar categorias: ${categoriesError}`;
    if (addonsError) return `Erro ao carregar adicionais: ${addonsError}`;
    return null;
  };

  const loading = loadingItems || loadingCategories || loadingAddons;
  const error = getErrorMessage();

  const filteredItems = menuItems?.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Gerenciamento de Cardápio
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Gerencie itens do menu, categorias e adicionais do seu restaurante.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_e, newValue) => setCurrentTab(newValue)} aria-label="Gerenciamento de Cardápio">
          <Tab label="Itens do Menu" />
          <Tab label="Categorias" />
          <Tab label="Adicionais" />
        </Tabs>
      </Box>

      {loading && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {!loading && !error && (
        <>
          {currentTab === 0 && ( // Itens do Menu
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddMenuItem}
                >
                  Adicionar Novo Item
                </Button>
                <TextField
                  label="Buscar itens"
                  variant="outlined"
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {filteredItems.length === 0 ? (
                <Typography variant="h6" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
                  Nenhum item encontrado.
                </Typography>
              ) : (
                <TableContainer component={Paper} elevation={3}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Imagem</TableCell>
                        <TableCell>Nome</TableCell>
                        <TableCell>Categoria</TableCell>
                        <TableCell>Preço</TableCell>
                        <TableCell>Disponível</TableCell>
                        <TableCell>Adicionais</TableCell>
                        <TableCell>Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} style={{ width: 50, height: 50, borderRadius: '4px', objectFit: 'cover' }} />
                            ) : (
                              <ImageIcon color="action" sx={{ fontSize: 50 }} />
                            )}
                          </TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.category_name}</TableCell>
                          <TableCell>R$ {item.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <Switch
                              checked={item.available}
                              onChange={() => handleUpdateItemAvailability(item.id.toString(), !item.available)}
                              color="primary"
                              inputProps={{ 'aria-label': 'toggle availability' }}
                            />
                          </TableCell>
                          <TableCell>
                            {item.has_addons ? <Chip label="Sim" color="info" size="small" /> : <Chip label="Não" size="small" />}
                          </TableCell>
                          <TableCell>
                            <IconButton color="primary" onClick={() => handleEditMenuItem(item)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton color="error" onClick={() => handleDeleteMenuItem(item.id.toString())}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {currentTab === 1 && ( // Categorias
            <Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddCategory}
                sx={{ mb: 3 }}
              >
                Adicionar Nova Categoria
              </Button>
              {categories?.length === 0 ? (
                <Typography variant="h6" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
                  Nenhuma categoria cadastrada.
                </Typography>
              ) : (
                <TableContainer component={Paper} elevation={3}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Nome</TableCell>
                        <TableCell>Descrição</TableCell>
                        <TableCell>Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {categories?.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell>{category.name}</TableCell>
                          <TableCell>{category.description || '-'}</TableCell>
                          <TableCell>
                            <IconButton color="primary" onClick={() => handleEditCategory(category)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton color="error" onClick={() => handleDeleteCategory(category.id.toString())}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {currentTab === 2 && ( // Adicionais
            <Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddAddonCategory}
                sx={{ mb: 3 }}
              >
                Adicionar Nova Categoria de Adicional
              </Button>

              {addonCategories?.length === 0 ? (
                <Typography variant="h6" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
                  Nenhuma categoria de adicional cadastrada.
                </Typography>
              ) : (
                addonCategories?.map(addonCat => (
                  <Paper key={addonCat.id} elevation={3} sx={{ p: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">{addonCat.name} (Min: {addonCat.min_selections}, Max: {addonCat.max_selections}, {addonCat.is_required ? 'Obrigatório' : 'Opcional'})</Typography>
                      <Box>
                        <IconButton color="primary" onClick={() => handleAddAddonOption(addonCat)}>
                          <AddIcon />
                        </IconButton>
                        <IconButton color="primary" onClick={() => handleEditAddonCategory(addonCat)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDeleteAddonCategory(addonCat.id.toString())}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Opções:</Typography>
                    {addonCat.options.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        Nenhuma opção cadastrada para esta categoria.
                      </Typography>
                    ) : (
                      <List dense sx={{ width: '100%' }}>
                        {addonCat.options.map(option => (
                          <ListItem
                            key={option.id}
                            secondaryAction={
                              <Box>
                                <IconButton edge="end" aria-label="edit" onClick={() => handleEditAddonOption(option, addonCat)}>
                                  <EditIcon color="primary" fontSize="small" />
                                </IconButton>
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteAddonOption(option.id.toString())}>
                                  <DeleteIcon color="error" fontSize="small" />
                                </IconButton>
                              </Box>
                            }
                          >
                            <ListItemText primary={`${option.name} (R$ ${option.price.toFixed(2)})`} />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Paper>
                ))
              )}
            </Box>
          )}
        </>
      )}

      {/* Modais de Formulário */}
      <Dialog open={isMenuItemFormModalOpen} onClose={() => setIsMenuItemFormModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedMenuItem ? "Editar Item do Menu" : "Adicionar Novo Item do Menu"}</DialogTitle>
        <DialogContent dividers>
          <MenuItemForm
            initialData={selectedMenuItem}
            categories={categories || []}
            addonCategories={addonCategories || []}
            onSubmit={handleSaveMenuItem}
            onCancel={() => setIsMenuItemFormModalOpen(false)}
            isSaving={loadingItems}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isCategoryFormModalOpen} onClose={() => setIsCategoryFormModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedCategory ? "Editar Categoria" : "Adicionar Nova Categoria"}</DialogTitle>
        <DialogContent dividers>
          <CategoryForm
            initialData={selectedCategory}
            onSubmit={handleSaveCategory}
            onCancel={() => setIsCategoryFormModalOpen(false)}
            isSaving={loadingCategories}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddonCategoryFormModalOpen} onClose={() => setIsAddonCategoryFormModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedAddonCategory ? "Editar Categoria de Adicional" : "Adicionar Nova Categoria de Adicional"}</DialogTitle>
        <DialogContent dividers>
          <AddonCategoryForm
            initialData={selectedAddonCategory}
            onSubmit={handleSaveAddonCategory}
            onCancel={() => setIsAddonCategoryFormModalOpen(false)}
            isSaving={loadingAddons}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddonOptionFormModalOpen} onClose={() => setIsAddonOptionFormModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{selectedAddonOption ? "Editar Opção de Adicional" : `Adicionar Opção para ${currentAddonCategoryForOption?.name}`}</DialogTitle>
        <DialogContent dividers>
          {currentAddonCategoryForOption && (
            <AddonOptionForm
              initialData={selectedAddonOption}
              onSubmit={handleSaveAddonOption}
              onCancel={() => setIsAddonOptionFormModalOpen(false)}
              isSaving={loadingAddons}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmação de Exclusão */}
      <ConfirmationDialog
        open={isConfirmDeleteModalOpen}
        onClose={() => setIsConfirmDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja remover este ${itemToDelete?.type === 'menuItem' ? 'item' : itemToDelete?.type === 'category' ? 'categoria' : itemToDelete?.type === 'addonCategory' ? 'categoria de adicional' : 'opção de adicional'}? Esta ação não pode ser desfeita.`}
        confirmButtonText="Remover"
        confirmButtonColor="error"
      />
    </Box>
  );
};

export default AdminItemManagementPage;