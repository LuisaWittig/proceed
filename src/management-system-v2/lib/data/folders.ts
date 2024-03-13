'use server';

import { getCurrentEnvironment, getCurrentUser } from '@/components/auth';
import { FolderUserInput, FolderUserInputSchema } from './folder-schema';
import {
  FolderChildren,
  createFolder as _createFolder,
  getFolderById,
  getRootFolder,
  moveFolder,
  updateFolderMetaData,
} from './legacy/folders';
import { UserErrorType, userError } from '../user-error';
import { toCaslResource } from '../ability/caslAbility';
import { moveProcess } from './legacy/_process';

export async function createFolder(folderInput: FolderUserInput) {
  try {
    const folder = FolderUserInputSchema.parse(folderInput);
    const { ability } = await getCurrentEnvironment(folder.environmentId);
    const { userId } = await getCurrentUser();

    if (!folder.parentId) folder.parentId = getRootFolder(folder.environmentId).id;

    _createFolder({ ...folder, createdBy: userId }, ability);
  } catch (e) {
    return userError("Couldn't create folder");
  }
}

export async function moveIntoFolder(items: FolderChildren[], folderId: string) {
  const folder = getFolderById(folderId);
  if (!folder) return userError('Folder not found');

  const { ability } = await getCurrentEnvironment(folder.environmentId);

  if (!ability.can('update', toCaslResource('Folder', folder)))
    return userError('Permission denied');

  for (const item of items) {
    if (['process', 'project', 'process-instance'].includes(item.type)) {
      moveProcess({
        processDefinitionsId: item.id,
        newFolderId: folderId,
        ability: ability,
      });
    } else if (item.type === 'folder') {
      moveFolder(item.id, folderId, ability);
    }
  }
}

/** This is only for updating a folder's metadata, to move a folder use moveIntoFolder */
export async function updateFolder(folderInput: Partial<FolderUserInput>, folderId: string) {
  try {
    const folder = getFolderById(folderId);
    if (!folder) return userError('Folder not found');

    const { ability } = await getCurrentEnvironment(folder.environmentId);

    const folderUpdate = FolderUserInputSchema.partial().parse(folderInput);
    if (folderUpdate.parentId) return userError('Wrong method for moving folders');

    updateFolderMetaData(folderId, folderUpdate, ability);
  } catch (e) {
    return userError("Couldn't create folder");
  }
}
