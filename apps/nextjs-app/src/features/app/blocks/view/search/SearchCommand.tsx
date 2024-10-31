import { useFields, useFieldStaticGetter } from '@teable/sdk/hooks';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
  TooltipProvider,
  Tooltip,
  Label,
  TooltipTrigger,
  TooltipContent,
  Switch,
  Button,
} from '@teable/ui-lib';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo } from 'react';

interface ISearchCommand {
  value: string;
  onChange: (fieldIds: string[] | null) => void;
}
export const SearchCommand = (props: ISearchCommand) => {
  const { onChange, value } = props;
  const { t } = useTranslation('common');
  const fields = useFields();
  const fieldStaticGetter = useFieldStaticGetter();

  const selectedFields = useMemo(() => {
    return value.split(',');
  }, [value]);

  const switchChange = (id: string, checked: boolean) => {
    let newSelectedFields = [...selectedFields];
    if (checked) {
      newSelectedFields.push(id);
    } else {
      newSelectedFields = newSelectedFields.filter((f) => f !== id);
    }
    onChange(newSelectedFields);
  };

  const commandFilter = useCallback(
    (fieldId: string, searchValue: string) => {
      const currentField = fields.find(
        ({ id }) => fieldId.toLocaleLowerCase() === id.toLocaleLowerCase()
      );
      const name = currentField?.name?.toLocaleLowerCase()?.trim() || t('untitled');
      const containWord = name.indexOf(searchValue.toLowerCase()) > -1;
      return Number(containWord);
    },
    [fields, t]
  );

  const enableGlobalSearch = value === 'all_fields';

  return (
    <Command filter={commandFilter}>
      {!enableGlobalSearch && (
        <>
          <CommandInput placeholder={t('actions.search')} className="h-8 text-xs" />
          <CommandList className="my-2 max-h-64">
            {<CommandEmpty>{t('listEmptyTips')}</CommandEmpty>}
            {fields.map((field) => {
              const { id, name, type, isLookup } = field;
              const { Icon } = fieldStaticGetter(type, isLookup);
              return (
                <CommandItem className="flex flex-1 truncate p-0" key={id} value={id}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex flex-1 items-center truncate p-0">
                          <Label
                            htmlFor={id}
                            className="flex flex-1 cursor-pointer items-center truncate p-2"
                          >
                            <Switch
                              id={id}
                              className="scale-75"
                              checked={selectedFields.includes(id)}
                              onCheckedChange={(checked) => {
                                switchChange(id, checked);
                              }}
                              disabled={selectedFields.includes(id) && selectedFields.length === 1}
                            />
                            <Icon className="ml-2 shrink-0" />
                            <span
                              className="h-full flex-1 cursor-pointer truncate pl-1 text-sm"
                              title={name}
                            >
                              {name}
                            </span>
                          </Label>
                        </div>
                      </TooltipTrigger>
                      {selectedFields.includes(id) && selectedFields.length === 1 ? (
                        <TooltipContent>
                          {t('atLeastOne', { noun: t('noun.field') })}
                        </TooltipContent>
                      ) : null}
                    </Tooltip>
                  </TooltipProvider>
                </CommandItem>
              );
            })}
          </CommandList>
        </>
      )}
      <Button
        className="w-full"
        variant={'outline'}
        size="xs"
        onClick={() => {
          onChange(value === 'all_fields' ? null : ['all_fields']);
        }}
      >
        {value === 'all_fields' ? t('actions.fieldSearch') : t('actions.globalSearch')}
      </Button>
    </Command>
  );
};
