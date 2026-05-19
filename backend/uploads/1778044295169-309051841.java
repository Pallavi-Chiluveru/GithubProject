import javax.swing.*;
import java.awt.*;
import java.awt.event.*;

public class JTBDemo extends JFrame{
JTBDemo(){
JTabbedPane tb= new JTabbedPane();
setTitle("JtabbedPane demo");
setSize(500,500);

JPanel p1,p2;
p1=new JPanel(new GridLayout(3,1,10,10));
Button b1 =new Button("IT");
Button b2 =new Button("IT");
Button b3 =new Button("IT");

p1.add(b1);
p1.add(b2);
p1.add(b3);

tb.addTab("Branches",p1);
p2= new JPanel(new GridLayout(3,1,10,10));
JCheckBox c1= new JCheckBox("ML");
JCheckBox c2= new JCheckBox("ML");
JCheckBox c3= new JCheckBox("ML");

p2.add(c1);
p2.add(c2);
p2.add(c3);
tb.addTab("SUBJECTS",p2);
add(tb);
setVisible(true);

}
public static void main(String args[]){
	new JTBDemo();
}
}