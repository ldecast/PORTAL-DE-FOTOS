import css from '@/styles/Select.module.css'

function Select({ name, options, onChange }) {
  return (
    <select className={css.base} onChange={onChange} name={name} id={name}>
      {options.map((value) => (
        <option key={value} value={value}>
          {value}
        </option>
      ))}
    </select>
  )
}

export default Select
