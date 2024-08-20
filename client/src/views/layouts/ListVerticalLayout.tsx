import * as React from 'react';
import { NextPage } from 'next';
import { Collapse, Icon, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import IconifyIcon from 'src/components/Icon';
import List from '@mui/material/List';
import { VerticalItems } from 'src/configs/layout';
type TProps = {
  open: boolean
}

type TListItems = {
  level: number,
  openItems: {
    [key: string]: boolean
  }
  items: any
  setOpenItems: React.Dispatch<
    React.SetStateAction<{
      [key: string]: boolean
    }>
  >
  disabled: boolean
}

const RecursiveListItems: NextPage<TListItems> = ({ items, level, openItems, setOpenItems, disabled }) => {
  const handleClick = (title: string) => {
    if (!disabled) {
      setOpenItems((prev) => ({
        ...prev,
        [title]: !prev[title]
      }));
    }
  }
  return (
    <>
      {items?.map((item: any) => {
        return (
          <React.Fragment key={item.title}>
            <ListItemButton
              sx={{
                padding: `8px 10px 8px ${level * (level === 1 ? 28 : 20)}px`,
              }}
              onClick={() => {
                if (item.childrens) {
                  handleClick(item.title)
                }
              }}
            >
              <ListItemIcon>
                <IconifyIcon icon={item?.icon} />
              </ListItemIcon>
              {!disabled && <ListItemText primary={item?.title} />}
              {item?.childrens && item.childrens.length > 0 && (
                <>
                  {openItems[item.title] ? (
                    <IconifyIcon icon={"ic:twotone-expand-less"} />
                  ) : (
                    <IconifyIcon icon={"ic:twotone-expand-less"} style={{ transform: "rotate(180deg)" }} />
                  )
                  }
                </>
              )}
            </ListItemButton>
            {item.childrens && item.childrens.length > 0 && (
              <>
                <Collapse in={openItems[item.title]} timeout="auto" unmountOnExit>
                  <RecursiveListItems items={item.childrens} level={level + 1} openItems={openItems} setOpenItems={setOpenItems} disabled={disabled} />
                </Collapse>
              </>
            )}
          </React.Fragment>
        )
      })}
    </>
  )
}

const ListVerticalLayout: NextPage<TProps> = ({ open }) => {
  const [openItems, setOpenItems] = React.useState<{ [key: string]: boolean }>({});

  React.useEffect(() => {
    if (!open) {
      handleToggleAll()
    }
  }, [open]);

  const handleToggleAll = () => {
    setOpenItems({});
  }
  return (
    <List
      sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
      component="nav"
      aria-labelledby="nested-list-subheader"
    >
      <RecursiveListItems
        items={VerticalItems}
        disabled={!open}
        level={1}
        openItems={openItems}
        setOpenItems={setOpenItems}
      />
    </List>
  );
}

export default ListVerticalLayout;