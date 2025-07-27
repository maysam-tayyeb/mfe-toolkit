import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ModalConfig } from '@mfe/dev-kit';

interface ModalState {
  isOpen: boolean;
  config: ModalConfig | null;
}

const initialState: ModalState = {
  isOpen: false,
  config: null,
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<ModalConfig>) => {
      state.isOpen = true;
      state.config = action.payload;
    },
    closeModal: (state) => {
      state.isOpen = false;
      state.config = null;
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;
export default modalSlice.reducer;
