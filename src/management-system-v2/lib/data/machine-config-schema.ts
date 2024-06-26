import { string, z } from 'zod';
import { VersionedObject } from './versioned-object-schema';
import { Prettify, WithRequired } from '../typescript-utils';

export const AbstractConfigInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  description: z
    .object({
      label: z.string().optional(),
      value: z.string().optional(),
    })
    .optional(),
  owner: z
    .object({
      label: z.string().optional(),
      value: z.string().optional(),
    })
    .optional(),
  userId: z //TODO: change to userIdentifier
    .object({
      label: z.string().optional(),
      value: z.string().optional(),
    })
    .optional(),
  folderId: z.string().optional(),
});

export type AbstractConfigInput = z.infer<typeof AbstractConfigInputSchema>;

export const AbstractConfigServerInputSchema = AbstractConfigInputSchema.extend({
  environmentId: z.string(),
});

export type AbstractConfigServerInput = z.infer<typeof AbstractConfigServerInputSchema>;

export type Metadata = {
  createdOn: string;
  createdBy: string;
  lastEditedBy: string;
  lastEditedOn: string;
};

export type ConfigParameter = Metadata & {
  id: string;
  key: string;
  value: string;
  unit: string;
  language: string;
  linkedParameters: string[];
  nestedParameters: ConfigParameter[];
};

export type Field = {
  label: string;
  value: string;
};

export type MachineConfigField = {
  id: string;
} & Field;

//Alternative TODO
export type FieldGroup = {
  key: string;
  value: string;
  id: string | undefined;
  label: string | undefined;
  unit: string | undefined;
  language: string | undefined;
};

export type Parameter = Metadata &
  FieldGroup & {
    linkedParameters: string[] | undefined;
    nestedParameters: Parameter[] | undefined;
  };

export type AbstractConfigMetadata = Prettify<
  WithRequired<AbstractConfigServerInput, 'id' | 'name' | 'folderId'> &
    Metadata & {
      picture: { label: string; value: string };
      parameters: ConfigParameter[];
      customFields: MachineConfigField[];
    } & VersionedObject<'config' | 'target-config' | 'machine-config'>
>;

export type MachineConfigMetadata = Prettify<
  WithRequired<AbstractConfigServerInput, 'id' | 'name' | 'folderId'> &
    AbstractConfigMetadata & {
      machine: { label: string; value: string };
    } & VersionedObject<'machine-config'>
>;

export type TargetConfigMetadata = Prettify<
  WithRequired<AbstractConfigServerInput, 'id' | 'name' | 'folderId'> &
    AbstractConfigMetadata &
    VersionedObject<'target-config'>
>;

export type ParentConfigMetadata = Prettify<
  WithRequired<AbstractConfigServerInput, 'id' | 'name' | 'folderId'> &
    AbstractConfigMetadata & {
      targetConfig: TargetConfigMetadata | undefined;
      machineConfigs: MachineConfigMetadata[];
    } & VersionedObject<'config'>
>;

export type ParentConfig = Prettify<ParentConfigMetadata>;
export type AbstractConfig = Prettify<AbstractConfigMetadata>;
export type TargetConfig = Prettify<TargetConfigMetadata>;
export type MachineConfig = Prettify<MachineConfigMetadata>;
