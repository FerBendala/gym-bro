import React from 'react';

import { SELECT_CONSTANTS } from '../constants';
import { SelectGroupsProps } from '../types';
import { buildGroupOptionClasses } from '../utils';

export const SelectGroups: React.FC<SelectGroupsProps> = ({ groups }) => {
  return (
    <>
      {groups.map((group) => (
        <optgroup
          key={group.label}
          label={group.label}
          className={SELECT_CONSTANTS.GROUP_OPTGROUP_CLASSES}
        >
          {group.options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className={buildGroupOptionClasses(option.disabled)}
            >
              {option.label}
            </option>
          ))}
        </optgroup>
      ))}
    </>
  );
};
