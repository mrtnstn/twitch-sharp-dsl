import React from "react"
import { action } from "mobx"
import { observer } from "mobx-react"

export interface EditState {
    value: any
    inEdit: boolean
    setValue: (newValue: any) => void
}

const isMissing = (value: any) => value === null || value === undefined

interface DisplayValueProps {
    editState: EditState
    className: string
    placeholderText: string
}

const DisplayValue: React.FC<DisplayValueProps> = ({ editState, className, placeholderText }) =>
    <span
        className={isMissing(editState.value) ? "value-missing has-issues" : className}
        onClick={action((event) => {
            event.stopPropagation()
            editState.inEdit = true
        })}
    >{isMissing(editState.value) ? placeholderText : editState.value}</span>

interface TextValueProps {
    editState: EditState
    placeholderText: string
}

export const TextValue: React.FC<TextValueProps> = observer(({ editState, placeholderText }) =>
    editState.inEdit
        ? <input
            type="text"
            defaultValue={editState.value}
            autoFocus={true}
            onBlur={action((event) => {
                const newValue = event.target.value
                editState.setValue(newValue)
                editState.inEdit = false
            })}
            onKeyUp={action((event) => {
                if (event.key === "Enter") {
                    const newValue = event.currentTarget.value
                    editState.setValue(newValue)
                    editState.inEdit = false
                }
                if (event.key === "Escape") {
                    editState.inEdit = false
                }
            })}
        />
        : <DisplayValue editState={editState} className="value" placeholderText={placeholderText} />
)

export interface Option {
    id: string
    text: string
    thing: string
}

interface DropDownValueProps {
    editState: EditState
    className: string
    options: Option[]
    placeholderText: string
    actionText?: string
}

export const DropDownValue: React.FC<DropDownValueProps> = observer(({ editState, className, options, placeholderText, actionText }) =>
    editState.inEdit
        ? <select
            autoFocus={true}
            value={editState.value}
            style={{ width: Math.max(
                    ...options.map((option) => option.text.length),
                    actionText ? actionText.length : 0
                ) + "ch"
            }}
            onChange={action((event) => {
                const newValue = event.target.value
                if (newValue !== "") {
                    editState.setValue(options.find((option) => option.id === newValue)?.thing)
                    editState.inEdit = false
                }
            })}
            onBlur={action((_) => {
                editState.inEdit = false
            })}
            onKeyUp={action((event) => {
                if (event.key === "Escape") {
                    editState.inEdit = false
                }
            })}
        >
            {actionText && <option value="" key={-1} className="action">{actionText}</option>}
            {options.map((option, index) => <option value={option.id} key={index}>{option.text}</option>)}
        </select>
        : <DisplayValue editState={editState} className={className} placeholderText={placeholderText} />
)

