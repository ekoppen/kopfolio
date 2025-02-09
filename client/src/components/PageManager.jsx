import React, { useMemo } from 'react';
import { useApi } from '../contexts/ApiContext';

const PageManager = () => {
  const api = useApi();
  const [pages, setPages] = React.useState([]);

  const sortedPages = useMemo(() => {
    return pages.sort((a, b) => {
      // Eerst sorteren op menu_order voor hoofdpagina's
      if (!a.parent_id && !b.parent_id) {
        return a.menu_order - b.menu_order;
      }
      // Dan sorteren op sub_order voor subpagina's
      if (a.parent_id === b.parent_id) {
        return a.sub_order - b.sub_order;
      }
      // Als één pagina een subpagina is en de andere niet, behoud dan de volgorde van de hoofdpagina's
      if (!a.parent_id) return -1;
      if (!b.parent_id) return 1;
      // Als ze verschillende parent_ids hebben, sorteer dan op de menu_order van hun parents
      const parentA = pages.find(p => p.id === a.parent_id);
      const parentB = pages.find(p => p.id === b.parent_id);
      return parentA.menu_order - parentB.menu_order;
    });
  }, [pages]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const newPages = Array.from(pages);
    const [removed] = newPages.splice(source.index, 1);
    newPages.splice(destination.index, 0, removed);

    // Update de menu_order voor hoofdpagina's en sub_order voor subpagina's
    const updatedPages = newPages.map((page, index) => {
      if (!page.parent_id) {
        return { ...page, menu_order: index };
      } else {
        // Groepeer subpagina's per parent en update hun sub_order
        const siblings = newPages.filter(p => p.parent_id === page.parent_id);
        const subIndex = siblings.findIndex(p => p.id === page.id);
        return { ...page, sub_order: subIndex };
      }
    });

    setPages(updatedPages);

    try {
      // Update menu_order voor hoofdpagina's
      const mainPages = updatedPages.filter(p => !p.parent_id);
      await api.updateMenuOrder(mainPages);

      // Update sub_order voor subpagina's, gegroepeerd per parent
      const parentIds = [...new Set(updatedPages.filter(p => p.parent_id).map(p => p.parent_id))];
      for (const parentId of parentIds) {
        const subPages = updatedPages.filter(p => p.parent_id === parentId);
        await api.updateSubOrder(subPages);
      }
    } catch (error) {
      console.error('Error updating page order:', error);
      // Herstel de originele volgorde
      setPages(pages);
    }
  };

  return (
    <div>
      {/* Render your components here */}
    </div>
  );
};

export default PageManager; 