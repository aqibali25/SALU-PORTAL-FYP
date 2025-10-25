import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";

export default function DataTable({
  columns = [],
  rows = [],
  sort,
  onSort,
  actions = [],
}) {
  const chevron = (key) => {
    if (sort?.key === key) {
      return sort.dir === "asc" ? (
        <FontAwesomeIcon icon={faAngleUp} className="text-xs" />
      ) : (
        <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
      );
    }
    return null;
  };

  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-gray-900 rounded-md">
      <table className="w-full border-collapse table-auto">
        <thead className="bg-[#D6D6D6] rounded-tl-md rounded-tr-md border-b-2 border-gray-500">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="!px-6 !py-3 text-left text-lg font-medium tracking-wider cursor-pointer select-none whitespace-nowrap"
                onClick={() => col.sortable !== false && onSort?.(col.key)}
              >
                <div className="flex items-center gap-2">
                  <span>{col.label}</span>
                  <span className="text-xs">{chevron(col.key)}</span>
                </div>
              </th>
            ))}
            {actions.length > 0 && (
              <th className="!px-6 !py-3 text-center text-lg font-medium tracking-wider whitespace-nowrap">
                Actions
              </th>
            )}
          </tr>
        </thead>

        {rows.length > 0 ? (
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="hover:bg-gray-100 dark:hover:bg-gray-800 transition border-b border-gray-300 dark:border-gray-700"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="!px-6 !py-3 text-md font-medium tracking-wider text-gray-900 dark:text-gray-100 whitespace-nowrap"
                  >
                    {row[col.key]}
                  </td>
                ))}

                {actions.length > 0 && (
                  <td className="!px-6 !py-3 whitespace-nowrap text-center">
                    <div className="flex justify-center items-center gap-4">
                      {actions.map((action, idx) =>
                        action.render ? (
                          // If the action provides a custom render function (like our Assign button)
                          <div key={idx}>{action.render(row)}</div>
                        ) : (
                          // Otherwise render default button with icon or label
                          <button
                            key={idx}
                            type="button"
                            onClick={() => action.onClick(row)}
                            className={action.className}
                            aria-label={`${action.label || "Action"} ${
                              row.username || ""
                            }`}
                          >
                            {action.icon || action.label}
                          </button>
                        )
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        ) : (
          <tbody>
            <tr>
              <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)}>
                <div className="w-full h-[30vh] flex items-center justify-center">
                  <h1 className="text-center text-gray-900 text-2xl dark:text-gray-100">
                    No data found.
                  </h1>
                </div>
              </td>
            </tr>
          </tbody>
        )}
      </table>
    </div>
  );
}
