import Image from "next/image";
import { Toast } from "primereact/toast";
import React, {
  CSSProperties,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { CiCirclePlus } from "react-icons/ci";
import { FiPlus } from "react-icons/fi";
import { IoMdSettings } from "react-icons/io";
import { MdCreate, MdDelete, MdDragIndicator, MdGroup } from "react-icons/md";
import Swal from "sweetalert2";
import { defaultBlurHash } from "../../data";
import {
  ErrorMessages,
  GroupOnSubject,
  StudentOnGroup,
  StudentOnSubject,
  UnitOnGroup,
} from "../../interfaces";
import {
  useCreateGroupOnSubject,
  useCreateUnitOnGroup,
  useDeleteGroupOnSubject,
  useDeleteUnitOnGroup,
  useGetGroupOnSubject,
  useGetGroupOnSubjects,
  useGetLanguage,
  useGetStudentOnSubject,
  useReorderStudentOnGroup,
  useReorderUnitGroup,
  useUpdateGroupOnSubject,
  useUpdateUnitOnGroup,
} from "../../react-query";
import { decodeBlurhashToCanvas } from "../../utils";
import ConfirmDeleteMessage from "../common/ConfirmDeleteMessage";
import LoadingBar from "../common/LoadingBar";
import LoadingSpinner from "../common/LoadingSpinner";
import PopupLayout from "../layout/PopupLayout";
import ListMemberCircle from "../member/ListMemberCircle";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
