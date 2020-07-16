import React, { useState, useEffect, useCallback } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const response = await api.get<IFoodPlate[]>('/foods');

      setFoods(response.data);
    }

    loadFoods();
  }, []);

  const handleAddFood = useCallback(
    async (food: Omit<IFoodPlate, 'id' | 'available'>): Promise<void> => {
      try {
        const response = await api.post('/foods', {
          ...food,
          available: true,
        });

        const moreFoods = response.data;
        setFoods([...foods, moreFoods]);
      } catch (err) {
        console.log(err);
      }
    },
    [foods],
  );

  const handleUpdateFood = useCallback(
    async (food: Omit<IFoodPlate, 'id' | 'available'>): Promise<void> => {
      const { id, available } = editingFood;

      const response = await api.put(`/foods/${id}`, {
        ...food,
        id,
        available,
      });

      const findFood = foods.map(theFood => {
        if (theFood.id === id) {
          return response.data;
        }
        return theFood;
      });
      setFoods(findFood);
    },
    [foods, editingFood],
  );

  const handleDeleteFood = useCallback(
    async (id: number): Promise<void> => {
      await api.delete(`/foods/${id}`);

      const attFoods = foods.filter(theFood => theFood.id !== id);

      setFoods(attFoods);
    },
    [foods],
  );

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    setEditModalOpen(true);
    setEditingFood(food);
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
