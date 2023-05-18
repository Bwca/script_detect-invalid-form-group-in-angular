javascript: (() => {
  try {
    const componentSelector = prompt(
      'Please enter component selector to check invalid form groups'
    );
    const domeElement = document.querySelector(componentSelector);
    const invalidTree = Object.entries(ng.getComponent(domeElement))
      .filter((i) => !!i[1]?.controls)
      .reduce((a, b) => ({ ...a, [b[0]]: findAllInvalidControls(b) }), {});
    console.log(invalidTree);
  } catch (e) {
    console.error('Could not check form groups for the following reason: ', e);
  }

  function findAllInvalidControls(fg) {
    return (fg[1].controls ? Object.entries(fg[1].controls) : [fg])
      .reduce((a, b) => {
        const item = { name: b[0], control: b[1] };
        /* Hit FormArrayControl */ 
        if (Number.isInteger(+item.name)) {
          item.name = `${fg[0]}[${item.name}]`;
        }
        if (item.control.invalid) {
          if (item.control.controls) {
            item.nestedControls = Object.entries(item.control.controls)
              .map(findAllInvalidControls)
              .filter((i) => Object.values(i).length)
              .reduce((a, b) => {
                const [name, value] = Object.entries(b)[0];
                return { ...a, [name]: value };
              }, {});
          }
          a.push(item);
        }
        return a;
      }, [])
      .reduce(
        (a, b) => ({
          ...a,
          [b.name]: b.nestedControls
            ? { control: b.control, nestedControls: b.nestedControls }
            : b.control,
        }),
        {}
      );
  }
})();
